# Pearls & Pastry

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Motion, with a small hand-written WebGL2/GLSL renderer for the floating boba pearls.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build status

- [x] Hero
- [x] Midsection: Customer Favourites (pinned, one scroll = one dish)
- [x] More Than A Café, Gallery, Visit, footer
- [x] Cart: Add on every favourite, header cart with live count, `/cart` page, order sent to the café on WhatsApp

## Hero: which tool does what

| Piece | Tool | Why |
|---|---|---|
| Cup, splash, roll, cheesecake | One photo (`public/images/hero/hero-cup.webp`), background removed so it can sit between layers | Your Gemini render, cut out with an ML matte plus a colour key, and the edges cleaned of the old backdrop |
| Floating pearls and crumbs | Raw WebGL2 + GLSL (`src/lib/pearls`) | Every pearl is lit by the same moving lamp, so its glint turns toward the cursor. That's one uniform in a shader, versus rewriting dozens of CSS gradients each frame. About 6 kB, so no three.js (~150 kB) for 22 sprites |
| Two pearl layers | Two canvases: one behind the cup and copy, one in front of everything | Pearls pass on both sides of the headline and the cup. That is the depth |
| Scroll depth, pointer parallax, pearl springs | One `requestAnimationFrame` loop (`heroEngine.ts`) writing transforms | About 30 things move every frame. Direct writes are cheaper than many motion values, and the loop pauses when the hero is off screen |
| Signature move | Same loop | The cursor is the lamp. Glints follow it, pearls drift out of its way, and a click knocks the nearby ones loose |
| Intro (headline rises, blob wipes in, lines draw) | CSS keyframes + a CSS `linear()` spring | Runs before hydration, so there's no flash of static content |
| Header lifting into a floating pill | `IntersectionObserver` on a sentinel + CSS transition | No scroll listener |
| Mobile menu | Motion `AnimatePresence` + staggered children | Enter/exit choreography is what Motion is best at |

Also handled:

- `prefers-reduced-motion`: static hero. No loop, no parallax, no intro, pearls drawn once.
- No WebGL2: the pearl canvases hide, and the photo still carries its own pearls.
- Phones: copy on top, cup below it, fewer pearls, no cursor physics (touch has no hover).

## Customer Favourites: which tool does what

| Piece | Tool | Why |
|---|---|---|
| The lazy-susan tray (dishes around a round tray, turning one per scroll) | One rAF loop (`favEngine.ts`) placing each dish on the rim | Size, softness, stacking and lean all follow each dish's angle on the tray, every frame. Math plus transforms, no library |
| One wheel flick / key = one dish | `lib/scrollSnap.ts` (same one as the 4th-folder site) | Trackpad inertia can't skip dishes, and at either end the page scrolls on normally |
| Drag to turn (phones and mouse) | `scrollSnap.ts` drag mode: pointer events + `touch-action: pan-y` | A sideways drag turns the tray 1:1 under the finger and settles on the nearest dish (a quarter-dish drag or a quick flick moves one). Vertical swipes stay native scrolling, and the tray turns with them continuously, then settles once the finger lifts |
| First-visit wiggle on touch screens | Same loop, a decaying offset on the tray angle | Shows it can be turned, without a text hint |
| Colours that follow the dish | `lib/palette.ts`: OKLab blend written to `--m-*` CSS variables | In-between colours stay rich instead of going grey |
| Dotted ring turning on the tray | SVG `stroke-dashoffset` driven by the same loop | Cheapest possible way to show rotation on an ellipse |
| Name, text and price swap | Motion `AnimatePresence` (words rise in and out) | Keyed enter/exit |
| Active card highlight | Motion `layoutId` spring | The highlight glides between cards |
| Hand-off from the hero | The section slides up over the hero as a rounded sheet (negative margin + radius) | Pure CSS |
| Order this | WhatsApp link with the dish and price pre-filled | Uses the number in `src/data/site.ts` |

## Things to replace

Prices are placeholders in `src/data/favourites.ts`.
`src/data/site.ts` holds the WhatsApp number (placeholder `910000000000`), nav links and hero text.

## Story, Gallery, Visit, footer

| Piece | Tool | Why |
|---|---|---|
| "Some days call for..." lines lighting up | Native CSS scroll-driven animation (`animation-timeline: view()`) | No JavaScript. Browsers without it show the lines fully lit |
| Polaroid and product print drifting at two speeds, polaroid tipping toward the cursor | Motion `useScroll` / `useTransform` + spring-smoothed motion values | Continuous values without React re-renders |
| Gallery belt | CSS keyframes on a doubled strip (the page's one marquee) | Loops without a seam, pauses on hover and focus, becomes a swipeable row under reduced motion |
| "Open now" on the hours card | Client-side check against India Standard Time, refreshed every minute | Real state, not decoration |
| Footer | Cocoa sheet rising over the page, the name in the house script | The ending resolves instead of fading out |

## Cart and ordering

Adapted from the Cumbre (4th folder) cart: the same framework-free store, with a WhatsApp hand-off added so the café actually receives the order.

| Piece | Where | How it works |
|---|---|---|
| Cart store | `src/lib/cartStore.ts` (+ `useCart` in `src/lib/cart.tsx`) | Plain store, saved to `localStorage` (guarded, so it works in private windows), synced across tabs, read with `useSyncExternalStore` |
| Add button | `components/cart/AddToCart.tsx` | Used on the favourites tray and in "Goes well with" on the cart page. Shows "Added" with a check for a moment |
| Header cart | `components/cart/CartLink.tsx` | Sits after Visit Us. The count badge pops on every add. On phones it's an icon beside the menu button |
| Added note | `components/cart/CartToast.tsx` | Dish thumbnail, "added", item count and a View cart button. Top right on desktop, bottom on phones |
| Cart page | `app/cart/page.tsx` + `components/cart/CartDesk.tsx` | Quantity steppers, remove, empty cart, "Goes well with" suggestions, then the order form: Pickup or Dine in (with table number), name, phone, note |
| Placing an order | same | Saves the order with a reference (`PP-XXXXXX`), opens WhatsApp with the whole order typed out, and shows a receipt with "Send on WhatsApp again" in case the app didn't open. Payment is at the café; nothing is charged online |
| Earlier orders | same | The last 20 orders on this device, under "Earlier orders" |

For real online payments later, you'd need a backend plus a gateway such as Razorpay.
