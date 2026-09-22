import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import Logo from "./Logo";
import { SITE } from "@/data/site";
import "./footer.css";

/** The ending: a cocoa sheet that rises over the page, the name set large in the house script. */
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <div className="foot__top">
        <div className="foot__brand">
          <Logo size={72} />
          <p>Boba, bakes and good meals.<br />Hugs in a cup, every day.</p>
        </div>
        <nav aria-label="Footer">
          <ul>
            {SITE.nav.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="foot__social">
          <a href={SITE.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <WhatsappLogo size={22} />
          </a>
          <a href={SITE.visit.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
            <InstagramLogo size={22} />
          </a>
        </div>
      </div>

      <p className="foot__word" aria-hidden="true">
        Pearls <span>&amp;</span> Pastry
      </p>

      <div className="foot__base">
        <span>© {year} Pearls &amp; Pastry</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
