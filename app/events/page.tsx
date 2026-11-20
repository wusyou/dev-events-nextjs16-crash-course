import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

const EventsPage = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  await connectToDatabase();
  const events: IEvent[] = JSON.parse(
    JSON.stringify(await Event.find().sort({ createdAt: -1 }).lean()),
  );

  return (
    <section className="space-y-7">
      <h1>All Events</h1>

      {events.length > 0 ? (
        <ul className="events">
          {events.map((event) => (
            <li className="list-none" key={event.slug}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No events yet.{" "}
          <Link href="/create" className="text-[#59deca] underline">
            Create the first one!
          </Link>
        </p>
      )}
    </section>
  );
};

export default EventsPage;
