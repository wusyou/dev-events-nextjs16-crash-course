import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event, { type IEvent } from "@/database/event.model";

type RouteParams = { params: Promise<{ slug: string }> };

/** Plain event object as returned by `.lean()`, including Mongo's identifiers. */
type EventResponse = IEvent & { _id: unknown; __v?: number };

type SuccessBody = { message: string; event: EventResponse };
type ErrorBody = { message: string; error?: string };

// Mirrors `generateSlug` in event.model.ts: lowercase alphanumerics separated by single hyphens.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

/**
 * GET /api/events/[slug]
 * Returns a single event identified by its URL slug.
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<SuccessBody | ErrorBody>> {
  try {
    const { slug: rawSlug } = await params;

    // Normalize the same way the model stores slugs (trimmed + lowercase).
    const slug = decodeURIComponent(rawSlug ?? "").trim().toLowerCase();

    if (!slug) {
      return NextResponse.json(
        { message: "Event slug is required" },
        { status: 400 },
      );
    }

    if (slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
      return NextResponse.json(
        {
          message:
            "Invalid event slug. Use lowercase letters, numbers, and single hyphens only.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // `lean()` returns a plain object, which is cheaper and serializes cleanly to JSON.
    const event = await Event.findOne({ slug }).lean<EventResponse>().exec();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${slug}" not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 },
    );
  } catch (error) {
    // `decodeURIComponent` throws URIError on malformed percent-encoding.
    if (error instanceof URIError) {
      return NextResponse.json(
        { message: "Invalid event slug encoding" },
        { status: 400 },
      );
    }

    console.error("[GET /api/events/[slug]] Failed to fetch event:", error);

    // Show error details only in development so internals don't leak in production.
    return NextResponse.json(
      {
        message: "An unexpected error occurred while fetching the event",
        ...(process.env.NODE_ENV === "development" && error instanceof Error
          ? { error: error.message }
          : {}),
      },
      { status: 500 },
    );
  }
}
