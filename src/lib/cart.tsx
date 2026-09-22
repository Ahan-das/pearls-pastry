"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import * as store from "./cartStore";

export type { CartLine, PlacedOrder, OrderMethod, AddedDetail } from "./cartStore";
export { formatINR, orderMessage, ADDED_EVENT } from "./cartStore";

/** React view of the cart. The store itself is framework-free (cartStore.ts). */
export function useCart() {
  useEffect(() => store.hydrate(), []);
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getServerState);
  return useMemo(
    () => ({
      lines: state.lines,
      orders: state.orders,
      count: store.countOf(state.lines),
      total: store.totalOf(state.lines),
      add: store.add,
      setQty: store.setQty,
      remove: store.remove,
      clear: store.clear,
      place: store.place,
    }),
    [state],
  );
}
