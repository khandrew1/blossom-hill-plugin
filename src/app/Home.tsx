import { useEffect, useState } from "react";
import type { HomeData } from "../data/events";
import cafeBackground from "./assets/blossom-cafe-background.png";

function readRoute(): string {
  return window.location.hash.slice(1) || "/";
}

export function Home({ data }: { data: HomeData }) {
  const [route, setRoute] = useState(readRoute);
  const selected = data.events.find((event) => route === `/events/${event.id}`);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="homepage">
      <header className="brand">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M12 20v-8M12 17c-4 0-6-2-6-5 4 0 6 2 6 5Zm0 2c4 0 6-2 6-5-4 0-6 2-6 5Z" />
          <path d="M12 3c1-2 4 0 3 2 4-1 5 3 2 4 2 3-2 5-4 2-1 4-5 3-5 0-4 1-5-3-2-4-2-3 2-5 4-2Z" />
        </svg>
        <h1>Blossom Hill</h1>
      </header>

      <main className="content">
        {selected ? (
          <section className="event-placeholder" aria-labelledby="event-title">
            <a className="back-link cursor-interaction" href="#/">← All events</a>
            <p className="eyebrow">Event overview</p>
            <h2 id="event-title">{selected.name}</h2>
            <p>The event overview is next. For now, this is just a place to land.</p>
          </section>
        ) : (
          <section aria-labelledby="upcoming-title">
            <div className="section-heading">
              <h2 id="upcoming-title">Coming up</h2>
              <span>{data.events.length} upcoming event{data.events.length === 1 ? "" : "s"}</span>
            </div>
            <div className="event-list">
              {data.events.map((event) => (
                <article className="event-row" key={event.id}>
                  <div className="date-marker" aria-label={event.date}>
                    <span className="date-day">{event.day}</span>
                    <div><span className="date-month">{event.month}</span><span className="date-weekday">{event.weekday}</span></div>
                  </div>
                  <a
                    className="event-card cursor-interaction"
                    href={`#/events/${event.id}`}
                    aria-label={`Open ${event.name}`}
                  >
                    <img className="event-image" src={cafeBackground} alt="" />
                    <div className="event-overlay" aria-hidden="true" />
                    <div className="card-content">
                      <div className="card-top">
                        <span className="guest-badge"><strong>{event.estimatedGuests}</strong> expected guests</span>
                        <span className="open-arrow" aria-hidden="true">↗</span>
                      </div>
                      <div>
                        <p className="event-time">{event.weekday} · {event.time} <span>PT</span></p>
                        <h3>{event.name}</h3>
                        <p className="event-location"><strong>{event.venue}</strong><span>{event.address}</span></p>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
            <p className="sample-note">A little something to look forward to. <span>Sample event</span></p>
          </section>
        )}
      </main>
    </div>
  );
}

