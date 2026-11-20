import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { cacheLife, cacheTag } from "next/cache";

const Page = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  await connectToDatabase();
  const events: IEvent[] = JSON.parse(
    JSON.stringify(await Event.find().sort({ createdAt: -1 }).lean()),
  );

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackatons, Meetup, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      {/* scroll-mt keeps the heading from hiding under the sticky navbar */}
      <div id="events" className="mt-20 space-y-7 scroll-mt-24">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.length > 0 &&
            events.map((event: IEvent) => (
              <li className="list-none" key={event.slug}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;
