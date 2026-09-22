/**
 * The cart, as a plain store (no framework), adapted from the Cumbre build.
 * Persists to localStorage, which can throw (private windows, blocked
 * storage), so every access is guarded. Nothing here charges money: an order
 * is saved on this device and sent to the café on WhatsApp.
 */
export type CartLine = {
  id: string;
  name: string;
  price: number; // rupees
  img: string;
  qty: number;
};

export type OrderMethod = "pickup" | "table";

export type PlacedOrder = {
  ref: string;
  placedAt: string;
  name: string;
  phone: string;
  method: OrderMethod;
  table: string;
  note: string;
  lines: CartLine[];
  total: number;
};

export type CartState = { lines: CartLine[]; orders: PlacedOrder[] };

const CART_KEY = "pearls-pastry.cart.v1";
const ORDERS_KEY = "pearls-pastry.orders.v1";

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the cart still works for this visit */
  }
}

/**
 * One frozen empty snapshot, shared by the server render and the first client
 * render. useSyncExternalStore compares snapshots by identity, so this must be
 * the same object every time.
 */
const EMPTY: CartState = { lines: [], orders: [] };

let state: CartState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

function set(next: CartState, persist = true) {
  state = next;
  if (persist && typeof window !== "undefined") {
    write(CART_KEY, state.lines);
    write(ORDERS_KEY, state.orders);
  }
  emit();
}

/** Call once on the client. Safe to call repeatedly. */
export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  set({ lines: read<CartLine[]>(CART_KEY, []), orders: read<PlacedOrder[]>(ORDERS_KEY, []) }, false);
  // another tab changed the cart
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY || e.key === ORDERS_KEY) {
      set({ lines: read<CartLine[]>(CART_KEY, []), orders: read<PlacedOrder[]>(ORDERS_KEY, []) }, false);
    }
  });
}

export const getState = () => state;
export const getServerState = (): CartState => EMPTY;

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Fired on window after every add, so the header badge and the toast can react. */
export type AddedDetail = { id: string; name: string; img: string; count: number };
export const ADDED_EVENT = "pearls-pastry:added";

export function add(item: Omit<CartLine, "qty">, qty = 1) {
  hydrate();
  const at = state.lines.findIndex((l) => l.id === item.id);
  const lines = [...state.lines];
  if (at < 0) lines.push({ ...item, qty });
  else lines[at] = { ...lines[at], qty: lines[at].qty + qty };
  set({ ...state, lines });
  window.dispatchEvent(
    new CustomEvent<AddedDetail>(ADDED_EVENT, { detail: { id: item.id, name: item.name, img: item.img, count: countOf(lines) } }),
  );
}

export function setQty(id: string, qty: number) {
  const lines = qty <= 0 ? state.lines.filter((l) => l.id !== id) : state.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 20) } : l));
  set({ ...state, lines });
}

export const remove = (id: string) => set({ ...state, lines: state.lines.filter((l) => l.id !== id) });
export const clear = () => set({ ...state, lines: [] });

export const totalOf = (lines: CartLine[]) => lines.reduce((s, l) => s + l.price * l.qty, 0);
export const countOf = (lines: CartLine[]) => lines.reduce((s, l) => s + l.qty, 0);

export function place(details: Omit<PlacedOrder, "ref" | "placedAt" | "lines" | "total">): PlacedOrder | null {
  if (state.lines.length === 0) return null;
  const order: PlacedOrder = {
    ...details,
    ref: `PP-${Math.random().toString(36).slice(2, 5).toUpperCase()}${String(Date.now()).slice(-3)}`,
    placedAt: new Date().toISOString(),
    lines: state.lines,
    total: totalOf(state.lines),
  };
  set({ lines: [], orders: [order, ...state.orders].slice(0, 20) });
  return order;
}

/** The order as a WhatsApp message the café can read at a glance. */
export function orderMessage(o: PlacedOrder) {
  const items = o.lines.map((l) => `• ${l.qty} x ${l.name}  ${formatINR(l.price * l.qty)}`).join("\n");
  const how = o.method === "table" ? `Dine in${o.table ? `, table ${o.table}` : ""}` : "Pickup at the counter";
  return [
    `New order ${o.ref}`,
    "",
    items,
    "",
    `Total: ${formatINR(o.total)} (pay at the café)`,
    `How: ${how}`,
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
    o.note ? `Note: ${o.note}` : "",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n")
    .trim();
}
