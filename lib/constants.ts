export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "AWS re:Invent 2026",
    image: "/images/event1.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV, USA",
    date: "November 30 - December 4, 2026",
    time: "8:00 AM - 6:00 PM PST",
  },
  {
    title: "KubeCon + CloudNativeCon Europe 2027",
    image: "/images/event2.png",
    slug: "kubecon-cloudnativecon-europe-2027",
    location: "Amsterdam, Netherlands",
    date: "March 23 - 26, 2027",
    time: "9:00 AM - 5:30 PM CET",
  },
  {
    title: "Google I/O 2027",
    image: "/images/event3.png",
    slug: "google-io-2027",
    location: "Mountain View, CA, USA",
    date: "May 18 - 19, 2027",
    time: "10:00 AM - 5:00 PM PDT",
  },
  {
    title: "Microsoft Build 2027",
    image: "/images/event4.png",
    slug: "microsoft-build-2027",
    location: "Seattle, WA, USA",
    date: "May 25 - 27, 2027",
    time: "9:00 AM - 6:00 PM PDT",
  },
  {
    title: "React Summit 2027",
    image: "/images/event5.png",
    slug: "react-summit-2027",
    location: "Amsterdam, Netherlands",
    date: "June 11 - 15, 2027",
    time: "9:30 AM - 6:00 PM CEST",
  },
  {
    title: "ETHGlobal Hackathon New York 2027",
    image: "/images/event6.png",
    slug: "ethglobal-new-york-2027",
    location: "New York, NY, USA",
    date: "June 25 - 27, 2027",
    time: "10:00 AM - 10:00 PM EDT",
  },
];
