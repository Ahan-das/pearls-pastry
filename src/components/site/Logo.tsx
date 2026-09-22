/**
 * The cup badge, redrawn as vector so it stays crisp at any size.
 * Same construction as the print on the cup: a double ring and the name set
 * in the house script, "Pearls" over "Pastry" with a small ampersand between.
 */
export default function Logo({ size = 58, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Pearls & Pastry"
    >
      <circle cx="60" cy="60" r="57" strokeWidth="3.5" style={{ fill: "var(--cream-hi)", stroke: "var(--cocoa)" }} />
      <circle cx="60" cy="60" r="50" fill="none" strokeWidth="1.2" opacity="0.55" style={{ stroke: "var(--cocoa)" }} />
      <g textAnchor="middle" style={{ fill: "var(--cocoa)", fontFamily: "var(--font-script)" }}>
        <text x="60" y="55" fontSize="29" textLength="80" lengthAdjust="spacingAndGlyphs">Pearls</text>
        <text x="60" y="66" fontSize="12">&amp;</text>
        <text x="60" y="89" fontSize="29" textLength="80" lengthAdjust="spacingAndGlyphs">Pastry</text>
      </g>
    </svg>
  );
}
