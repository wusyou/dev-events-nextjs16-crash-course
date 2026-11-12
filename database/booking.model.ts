import { Schema, model, models, type HydratedDocument, type Model, type Types } from "mongoose";
import { Event } from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

// Pragmatic email check: one "@", no whitespace, and a dotted domain.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true, // store canonically so lookups are case-insensitive
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: "Please provide a valid email address",
      },
    },
  },
  { timestamps: true }
);

// Bookings are most often queried per event, so index the foreign key.
bookingSchema.index({ eventId: 1 });

// MongoDB has no foreign-key constraints, so verify the referenced event exists before saving.
bookingSchema.pre("save", async function () {
  if (!this.isNew && !this.isModified("eventId")) return;

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event with ID ${this.eventId.toString()} does not exist`);
  }
});

// Reuse the compiled model across Next.js hot reloads to avoid OverwriteModelError.
export const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking> | undefined) ?? model<IBooking>("Booking", bookingSchema);

export default Booking;
