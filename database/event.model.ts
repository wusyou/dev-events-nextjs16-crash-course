import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export const EVENT_MODES = ["online", "offline", "hybrid"] as const;
export type EventMode = (typeof EVENT_MODES)[number];

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

// Empty arrays pass Mongoose's `required` check, so enforce at least one non-blank item.
const nonEmptyStringArray = {
  validator: (values: string[]): boolean =>
    values.length > 0 && values.every((value) => value.trim().length > 0),
  message: "{PATH} must contain at least one non-empty item",
};

/*
 * `trim` runs before validation, and `required` rejects empty strings,
 * so whitespace-only values fail validation as well.
 */
const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    // Derived from `title` in the pre-save hook, so not supplied by callers.
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    overview: { type: String, required: [true, "Overview is required"], trim: true },
    image: { type: String, required: [true, "Image is required"], trim: true },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    date: { type: String, required: [true, "Date is required"], trim: true },
    time: { type: String, required: [true, "Time is required"], trim: true },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: EVENT_MODES,
        message: `Mode must be one of: ${EVENT_MODES.join(", ")}`,
      },
    },
    audience: { type: String, required: [true, "Audience is required"], trim: true },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: nonEmptyStringArray,
    },
    organizer: { type: String, required: [true, "Organizer is required"], trim: true },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: nonEmptyStringArray,
    },
  },
  { timestamps: true }
);

// Unique index guarantees each slug maps to exactly one event URL.
eventSchema.index({ slug: 1 }, { unique: true });

/** Converts a title into a URL-friendly slug, e.g. "Next.js Conf 2025!" -> "next-js-conf-2025". */
function generateSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents left over from NFKD decomposition
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // collapse each run of non-alphanumerics into one hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/** Parses any `Date`-parsable string and returns an ISO calendar date (YYYY-MM-DD). */
function normalizeDate(input: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: "${input}"`);
  }
  return parsed.toISOString().split("T")[0];
}

/** Accepts 24h ("14:30") or 12h ("2:30 PM") input and returns 24h "HH:mm". */
function normalizeTime(input: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid time: "${input}". Use "HH:mm" or "h:mm AM/PM".`);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();

  if (meridiem) {
    if (hours < 1 || hours > 12) throw new Error(`Invalid time: "${input}"`);
    if (meridiem === "pm" && hours !== 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time: "${input}"`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Mongoose 9 middleware signals failure by throwing (there's no `next` callback).
eventSchema.pre("save", function () {
  // Regenerate the slug only when the title changes, so published URLs stay stable.
  if (this.isModified("title") || !this.slug) {
    const slug = generateSlug(this.title);
    if (!slug) {
      throw new Error("Title must contain at least one letter or number");
    }
    this.slug = slug;
  }

  // Store date/time in one canonical format so sorting and display are predictable.
  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }
  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

// Reuse the compiled model across Next.js hot reloads to avoid OverwriteModelError.
export const Event: Model<IEvent> =
  (models.Event as Model<IEvent> | undefined) ?? model<IEvent>("Event", eventSchema);

export default Event;
