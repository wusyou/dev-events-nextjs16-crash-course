"use server";
import Booking from "@/database/booking.model";

import connectToDatabase from "../mongodb";

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    await connectToDatabase();
    await Booking.create({ eventId, email });

    return { success: true };
  } catch (e) {
    console.error("creating booking failed", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Booking failed",
    };
  }
};
