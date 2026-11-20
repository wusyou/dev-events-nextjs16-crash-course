import Image from "next/image";

// A plain link that scrolls down to the "Featured Events" section (id="events" in app/page.tsx).
const ExploreBtn = () => {
  return (
    <a
      href="#events"
      id="explore-btn"
      className="mt-7 mx-auto items-center justify-center gap-2"
    >
      Explore Events
      <Image
        src="/icons/arrow-down.svg"
        alt="arrow-down"
        width={24}
        height={24}
      />
    </a>
  );
};

export default ExploreBtn;
