# Wozani Africa — Website

Single-page, scroll-driven site for Wozani Africa Events (Event, Brand & Destination Marketing, KZN South Coast). Static — no build step, no framework.

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173. Or use the `wozani` config in `.claude/launch.json`.

## Structure

- `index.html` — all content and sections (hero, about, services, legacy, brands, gallery, promoters, contact, footer)
- `css/style.css` — design system (brand colors sampled from the logo: orange `#f07030`, olive `#7f8400`, ink, warm paper)
- `js/main.js` — GSAP ScrollTrigger + Lenis wiring: preloader, pinned horizontal services scroll, marquees, hover previews, lightbox, cursor, form
- `js/vendor/` — gsap 3.12.5, ScrollTrigger, lenis 1.1.14 (vendored, no CDN)
- `assets/fonts/` — Clash Display + Satoshi (self-hosted woff2, Fontshare licence)
- `assets/img/` — optimized webp derived from wozaniafrica.co.za media library + logo variants

## Notes

- **Enquiry form** opens a pre-filled `mailto:` to `info@wozaniafrica.co.za` — confirm this inbox with the client and change it in `js/main.js` (one line, search for `mailto`). Upgrade path: Formspree or any POST endpoint.
- `?qa` URL param renders the static (reduced-motion) variant for screenshot tooling; `&at=<px>` scrolls there on load.
- Reduced-motion users get the full content statically (services panels stack vertically).
- Unused alternate photos (wide-*.webp not referenced) are kept in `assets/img/` for future use; they are never downloaded by browsers.
