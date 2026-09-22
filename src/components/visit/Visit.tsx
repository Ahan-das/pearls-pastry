"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, MapPin, WhatsappLogo } from "@phosphor-icons/react";
import { SITE } from "@/data/site";
import "./visit.css";

type Hours = (typeof SITE.visit.hours)[number];

/** minutes since midnight in India Standard Time, whatever the visitor's own zone */
const istMinutes = () => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { mins: +get("hour") * 60 + +get("minute"), weekend: ["Sat", "Sun"].includes(get("weekday")) };
};
const toMins = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pretty = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
};

export default function Visit() {
  const { visit } = SITE;
  // rendered on the client only, so the server never guesses the time
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const { mins, weekend } = istMinutes();
      const today: Hours = visit.hours[weekend ? 1 : 0];
      setOpen(mins >= toMins(today.open) && mins < toMins(today.close));
    };
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [visit.hours]);

  return (
    <section id="visit" className="visit" aria-labelledby="visit-title">
      <div className="visit__grid">
        <div className="visit__words">
          <h2 id="visit-title">Come say hi.</h2>
          <address className="visit__address">
            <MapPin size={20} aria-hidden="true" />
            <span>
              {visit.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </address>
          <div className="visit__ctas">
            <a className="btn btn--solid" href={visit.mapsUrl} target="_blank" rel="noreferrer">
              <span>Get directions</span>
              <i aria-hidden="true">
                <ArrowUpRight size={16} weight="bold" />
              </i>
            </a>
            <a className="btn btn--line" href={SITE.whatsapp} target="_blank" rel="noreferrer">
              <span>Order on WhatsApp</span>
              <WhatsappLogo size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="visit__card">
          <div className="visit__card-in">
            <div className="visit__card-head">
              <Clock size={20} aria-hidden="true" />
              <h3>Opening hours</h3>
              {open !== null && (
                <span className="visit__status" data-open={open || undefined}>
                  {open ? "Open now" : "Closed now"}
                </span>
              )}
            </div>
            <dl className="visit__hours">
              {visit.hours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>
                    {pretty(h.open)} to {pretty(h.close)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="visit__note">Walk in any time. For big orders, message us a day ahead.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
