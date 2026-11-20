import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventsPage = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  const response = await fetch(`${BASE_URL}/api/events`);
  const { events }: { events?: IEvent[] } = await response.json();

  return (
    <section className="space-y-7">
      <h1>All Events</h1>

      {events && events.length > 0 ? (
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
