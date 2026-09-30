// The only event in this first scaffold. No persistence or live attendee data.
export interface EventSummary {
  id: string;
  name: string;
  date: string;
  day: string;
  month: string;
  weekday: string;
  time: string;
  timeZone: string;
  venue: string;
  address: string;
  estimatedGuests: number;
}

export interface HomeData {
  events: EventSummary[];
}

export const demoHome: HomeData = {
  events: [{
    id: "blossom-hill-cafe-2026",
    name: "Blossom Hill Cafe",
    date: "October 28, 2026",
    day: "28",
    month: "October",
    weekday: "Wednesday",
    time: "6:00–9:00 PM",
    timeZone: "America/Los_Angeles",
    venue: "The Glasshouse",
    address: "84 Orchard Lane · San Jose, CA",
    estimatedGuests: 150,
  }],
};

