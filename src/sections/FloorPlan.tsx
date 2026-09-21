import { useState } from "react";
import { APARTMENTS } from "../data/content";
import type { ApartmentType } from "../data/content";
import FadeIn from "../components/FadeIn";
import floorplanA2d from "../assets/images/floorplan-a-2d.webp";
import floorplanA3d from "../assets/images/floorplan-a-3d.webp";
import floorplanB2d from "../assets/images/floorplan-b-2d.webp";
import floorplanB3d from "../assets/images/floorplan-b-3d.webp";
import "./FloorPlan.css";

const PLAN_IMAGES: Record<ApartmentType["id"], { "2d": string; "3d": string }> = {
  "4bhk": { "2d": floorplanA2d, "3d": floorplanA3d },
  "3bhk": { "2d": floorplanB2d, "3d": floorplanB3d },
};

export default function FloorPlan() {
  const [bhk, setBhk] = useState<ApartmentType["id"]>("4bhk");
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [activeRoom, setActiveRoom] = useState<number | null>(null);

  const apt = APARTMENTS[bhk];
  const image = PLAN_IMAGES[bhk][mode];
  const hovered = activeRoom !== null ? apt.roomLabels[activeRoom] : null;

  return (
    <section id="floorplan" className="floorplan rhythm section-pad">
      <div className="grid-12 floorplan-head">
        <FadeIn as="span" className="eyebrow is-accent" style={{ gridColumn: "1 / 5" }}>
          The Floor Plan
        </FadeIn>
        <FadeIn as="h2" className="floorplan-title" delay={80} style={{ gridColumn: "1 / 9" }}>
          Walk the layout before you walk the home.
        </FadeIn>
      </div>

      <div className="floorplan-controls">
        <div className="floorplan-tabs">
          {(["4bhk", "3bhk"] as const).map((id) => (
            <button
              key={id}
              className={bhk === id ? "is-active" : ""}
              onClick={() => {
                setBhk(id);
                setActiveRoom(null);
              }}
            >
              {APARTMENTS[id].label}
            </button>
          ))}
        </div>
        <span className="floorplan-divider" aria-hidden="true" />
        <div className="floorplan-tabs">
          {(["2d", "3d"] as const).map((m) => (
            <button key={m} className={mode === m ? "is-active" : ""} onClick={() => setMode(m)}>
              {m.toUpperCase()} Plan
            </button>
          ))}
        </div>
      </div>

      <div className="floorplan-body">
        <div className="floorplan-nav" aria-label="Room list">
          {apt.roomLabels.map((room, i) => (
            <button
              key={room.name}
              className={`floorplan-nav-item ${activeRoom === i ? "is-active" : ""}`}
              onMouseEnter={() => setActiveRoom(i)}
              onFocus={() => setActiveRoom(i)}
              onMouseLeave={() => setActiveRoom(null)}
              onClick={() => setActiveRoom(activeRoom === i ? null : i)}
            >
              <span className="floorplan-nav-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="floorplan-nav-name">{room.name}</span>
              {room.dimensions && <span className="floorplan-nav-dim">{room.dimensions}</span>}
            </button>
          ))}
        </div>

        <div className="floorplan-stage">
          <div className="floorplan-image-wrap">
            <img src={image} alt={`${apt.label} ${mode.toUpperCase()} floor plan, ${apt.flatCode}`} key={image} />

            <div
              className="floorplan-spotlight"
              style={
                hovered
                  ? ({
                      opacity: 1,
                      "--sx": `${hovered.x}%`,
                      "--sy": `${hovered.y}%`,
                    } as React.CSSProperties)
                  : { opacity: 0 }
              }
            />

            {apt.roomLabels.map((room, i) => (
              <button
                key={room.name}
                className={`floorplan-hotspot ${activeRoom === i ? "is-active" : ""}`}
                style={{ left: `${room.x}%`, top: `${room.y}%` }}
                onMouseEnter={() => setActiveRoom(i)}
                onMouseLeave={() => setActiveRoom(null)}
                onClick={() => setActiveRoom(activeRoom === i ? null : i)}
                aria-label={room.name}
              >
                <span className="floorplan-hotspot-dot" />
                <span className="floorplan-hotspot-tag">{room.name}</span>
              </button>
            ))}
          </div>
          <p className="floorplan-hint">Hover a room to explore &middot; {apt.flatCode}</p>
        </div>
      </div>
    </section>
  );
}
