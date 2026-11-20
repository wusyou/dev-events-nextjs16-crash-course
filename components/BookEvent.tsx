"use client";

import { createBooking } from "@/lib/actions/booking.action";
import posthog from "posthog-js";
import { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await createBooking({ eventId, email });

    if (result.success) {
      setSubmitted(true);
      posthog.capture("event_booked", { eventId, slug, email });
    } else {
      console.error("Booking creation failed", result.error);
      posthog.captureException(new Error(result.error));
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              className="w-full rounded-md bg-[#1f2a2e] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#59deca]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#59deca] py-3 text-base font-semibold text-black transition hover:bg-[#4cc9b6] cursor-pointer"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
