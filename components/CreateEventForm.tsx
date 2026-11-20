"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

// Keep in sync with EVENT_MODES in database/event.model.ts. Not imported from
// there because that file pulls mongoose into the browser bundle.
const EVENT_MODES = ["online", "offline", "hybrid"] as const;

const inputClass =
  "w-full rounded-md bg-[#1f2a2e] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#59deca]";

const Field = ({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

// Splits text into trimmed, non-empty items (e.g. one agenda item per line).
const toList = (value: string, separator: string | RegExp) =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

const CreateEventForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    // The API route expects tags and agenda as JSON arrays.
    formData.set(
      "agenda",
      JSON.stringify(toList(String(formData.get("agenda") ?? ""), /\r?\n/)),
    );
    formData.set(
      "tags",
      JSON.stringify(toList(String(formData.get("tags") ?? ""), ",")),
    );

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Event creation failed");
      }

      posthog.capture("event_created", { slug: data.event.slug });
      router.push(`/events/${data.event.slug}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Event creation failed";
      setError(message);
      posthog.captureException(e);
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Field label="Title" htmlFor="title">
        <input id="title" name="title" required className={inputClass} placeholder="React Summit 2027" />
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea id="description" name="description" required rows={3} className={inputClass} placeholder="Short description of the event" />
      </Field>

      <Field label="Overview" htmlFor="overview">
        <textarea id="overview" name="overview" required rows={4} className={inputClass} placeholder="What attendees can expect" />
      </Field>

      <Field label="Event Image" htmlFor="image">
        <input id="image" name="image" type="file" accept="image/*" required className={inputClass} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Venue" htmlFor="venue">
          <input id="venue" name="venue" required className={inputClass} placeholder="Convention Center" />
        </Field>

        <Field label="Location" htmlFor="location">
          <input id="location" name="location" required className={inputClass} placeholder="Manila, Philippines" />
        </Field>

        <Field label="Date" htmlFor="date">
          <input id="date" name="date" type="date" required className={inputClass} />
        </Field>

        <Field label="Time" htmlFor="time">
          <input id="time" name="time" type="time" required className={inputClass} />
        </Field>

        <Field label="Mode" htmlFor="mode">
          <select id="mode" name="mode" required defaultValue="offline" className={inputClass}>
            {EVENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Audience" htmlFor="audience">
          <input id="audience" name="audience" required className={inputClass} placeholder="Developers, students" />
        </Field>
      </div>

      <Field label="Organizer" htmlFor="organizer">
        <input id="organizer" name="organizer" required className={inputClass} placeholder="Who is hosting this event?" />
      </Field>

      <Field label="Agenda" htmlFor="agenda" hint="One item per line">
        <textarea id="agenda" name="agenda" required rows={4} className={inputClass} placeholder={"Opening keynote\nWorkshops\nNetworking"} />
      </Field>

      <Field label="Tags" htmlFor="tags" hint="Separate with commas">
        <input id="tags" name="tags" required className={inputClass} placeholder="react, nextjs, frontend" />
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#59deca] py-3 text-base font-semibold text-black transition hover:bg-[#4cc9b6] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
};

export default CreateEventForm;
