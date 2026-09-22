"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Storefront, Tote, Armchair, WhatsappLogo, X } from "@phosphor-icons/react";
import { formatINR, orderMessage, useCart, type OrderMethod, type PlacedOrder } from "@/lib/cart";
import { FAVOURITES } from "@/data/favourites";
import { SITE } from "@/data/site";
import AddToCart from "./AddToCart";
import "./cart.css";
import "./desk.css";

const EASE = [0.16, 1, 0.3, 1] as const;
const toneOf = (id: string) => FAVOURITES.find((f) => f.id === id)?.soft ?? "var(--cream)";
const waLink = (o: PlacedOrder) => `${SITE.whatsapp.split("?")[0]}?text=${encodeURIComponent(orderMessage(o))}`;

function Stepper({ qty, name, onChange }: { qty: number; name: string; onChange: (n: number) => void }) {
  return (
    <div className="step" role="group" aria-label={`Quantity of ${name}`}>
      <button type="button" onClick={() => onChange(qty - 1)} aria-label={qty === 1 ? `Remove ${name}` : "One fewer"}>
        <Minus size={14} weight="bold" />
      </button>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={qty} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.22 }}>
          {qty}
        </motion.span>
      </AnimatePresence>
      <button type="button" onClick={() => onChange(qty + 1)} aria-label="One more" disabled={qty >= 20}>
        <Plus size={14} weight="bold" />
      </button>
    </div>
  );
}

/** The cart page: what you picked, and the short form that turns it into an order. */
export default function CartDesk() {
  const { lines, total, count, setQty, remove, clear, place, orders } = useCart();
  const reduced = useReducedMotion();
  const [done, setDone] = useState<PlacedOrder | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", method: "pickup" as OrderMethod, table: "", note: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const suggestions = FAVOURITES.filter((f) => !lines.some((l) => l.id === f.id)).slice(0, 3);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Tell us who the order is for.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Add a 10-digit number so we can call when it's ready.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const placed = place({ name: form.name.trim(), phone: form.phone.trim(), method: form.method, table: form.table.trim(), note: form.note.trim() });
    if (!placed) return;
    // hand the order to the café straight away (inside the click, so it isn't blocked as a pop-up)
    window.open(waLink(placed), "_blank", "noopener");
    setDone(placed);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  if (done) {
    return (
      <section className="desk desk--done" aria-labelledby="desk-title">
        <motion.div className="done" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          <span className="done__tick" aria-hidden="true">
            <Check size={28} weight="bold" />
          </span>
          <h1 id="desk-title" className="desk__title">
            Thank you, {done.name.split(" ")[0]}.
          </h1>
          <p className="done__lede">
            Order <b>{done.ref}</b> is on its way to us on WhatsApp. We will call {done.phone} when it is ready
            {done.method === "table" ? ` and bring it to ${done.table ? `table ${done.table}` : "your table"}.` : " to collect at the counter."}
          </p>
          <div className="receipt">
            <ul>
              {done.lines.map((l) => (
                <li key={l.id}>
                  <span>
                    {l.qty} x {l.name}
                  </span>
                  <span>{formatINR(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="receipt__total">
              <span>Pay at the café</span>
              <b>{formatINR(done.total)}</b>
            </div>
          </div>
          <div className="done__actions">
            <a className="btn btn--solid" href={waLink(done)} target="_blank" rel="noreferrer">
              <span>Send on WhatsApp again</span>
              <i aria-hidden="true">
                <WhatsappLogo size={17} />
              </i>
            </a>
            <Link className="btn btn--line" href="/#menu">
              <span>Back to the menu</span>
            </Link>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="desk" aria-labelledby="desk-title">
      <div className="desk__head">
        <Link href="/#menu" className="desk__back">
          <ArrowLeft size={15} weight="bold" /> Keep browsing
        </Link>
        <h1 id="desk-title" className="desk__title">
          Your cart
        </h1>
        {count > 0 && (
          <p className="desk__count">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {count === 0 ? (
        <div className="empty">
          <span className="empty__art" aria-hidden="true">
            <Tote size={40} weight="light" />
          </span>
          <p className="empty__title">Nothing in here yet.</p>
          <p className="empty__body">Pick a favourite and it will wait for you here.</p>
          <Link className="btn btn--solid" href="/#menu">
            <span>See favourites</span>
            <i aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </i>
          </Link>
        </div>
      ) : (
        <div className="desk__grid">
          <div className="desk__main">
            <ul className="lines">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li
                    key={l.id}
                    layout={!reduced}
                    className="line"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, transition: { duration: 0.22 } }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <span className="line__thumb" style={{ background: toneOf(l.id) }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- small thumbnail */}
                      <img src={l.img} alt="" />
                    </span>
                    <span className="line__text">
                      <b>{l.name}</b>
                      <small>{formatINR(l.price)} each</small>
                    </span>
                    <Stepper qty={l.qty} name={l.name} onChange={(n) => setQty(l.id, n)} />
                    <span className="line__sum">{formatINR(l.price * l.qty)}</span>
                    <button type="button" className="line__remove" onClick={() => remove(l.id)} aria-label={`Remove ${l.name}`}>
                      <X size={16} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <button type="button" className="desk__clear" onClick={clear}>
              Empty the cart
            </button>

            {suggestions.length > 0 && (
              <div className="more">
                <h2>Goes well with</h2>
                <ul>
                  {suggestions.map((f) => (
                    <li key={f.id} className="more__item">
                      <span className="line__thumb" style={{ background: f.soft }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- small thumbnail */}
                        <img src={f.img} alt="" />
                      </span>
                      <span className="line__text">
                        <b>{f.name}</b>
                        <small>{formatINR(f.price)}</small>
                      </span>
                      <AddToCart className="more__add" id={f.id} name={f.name} price={f.price} img={f.img} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="summary" aria-label="Order details">
            <form className="summary__in" onSubmit={submit} noValidate>
              <div className="summary__rows">
                <div>
                  <span>Items</span>
                  <span>{count}</span>
                </div>
                <div className="summary__total">
                  <span>Total</span>
                  <b>{formatINR(total)}</b>
                </div>
                <p className="summary__note">You pay at the café when you collect. Nothing is charged here.</p>
              </div>

              <fieldset className="choice">
                <legend>How would you like it?</legend>
                <label data-on={form.method === "pickup" || undefined}>
                  <input type="radio" name="method" checked={form.method === "pickup"} onChange={() => setForm({ ...form, method: "pickup" })} />
                  <Storefront size={20} aria-hidden="true" />
                  <span>Pickup</span>
                </label>
                <label data-on={form.method === "table" || undefined}>
                  <input type="radio" name="method" checked={form.method === "table"} onChange={() => setForm({ ...form, method: "table" })} />
                  <Armchair size={20} aria-hidden="true" />
                  <span>Dine in</span>
                </label>
              </fieldset>

              <div className="field">
                <label htmlFor="o-name">Name</label>
                <input id="o-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "o-name-err" : undefined} />
                {errors.name && <p className="field__err" id="o-name-err">{errors.name}</p>}
              </div>
              <div className="field">
                <label htmlFor="o-phone">Phone</label>
                <input id="o-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "o-phone-err" : undefined} />
                {errors.phone && <p className="field__err" id="o-phone-err">{errors.phone}</p>}
              </div>
              <AnimatePresence initial={false}>
                {form.method === "table" && (
                  <motion.div className="field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                    <label htmlFor="o-table">Table number <small>(optional)</small></label>
                    <input id="o-table" value={form.table} onChange={(e) => setForm({ ...form, table: e.target.value })} inputMode="numeric" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="field">
                <label htmlFor="o-note">Anything else <small>(optional)</small></label>
                <textarea id="o-note" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Less ice, extra pearls..." />
              </div>

              <motion.button type="submit" className="btn btn--solid summary__place" whileTap={{ scale: 0.97 }}>
                <span>Place order</span>
                <i aria-hidden="true">
                  <WhatsappLogo size={17} />
                </i>
              </motion.button>
              <p className="summary__small">Placing the order opens WhatsApp with everything filled in, so we can start on it.</p>
            </form>
          </aside>
        </div>
      )}

      {orders.length > 0 && !done && (
        <details className="past">
          <summary>Earlier orders ({orders.length})</summary>
          <ul>
            {orders.map((o) => (
              <li key={o.ref}>
                <b>{o.ref}</b>
                <span>{new Date(o.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span>{o.lines.reduce((s, l) => s + l.qty, 0)} items</span>
                <span>{formatINR(o.total)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
