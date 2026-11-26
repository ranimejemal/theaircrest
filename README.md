# THE AIRCREST

Website for THE AIRCREST, a Tunisia-based private jet charter broker.
Static site hosted on Vercel: every push to `main` is deployed automatically.

## Pages

| Path | Page |
|---|---|
| `/` (`index.html`) | Homepage, English |
| `/fr/` (`fr/index.html`) | Homepage, French |
| `/privacy-policy.html` · `/fr/confidentialite.html` | Privacy policy (GDPR), EN / FR. PDF: `assets/THE-AIRCREST-Privacy-Policy.pdf` |
| `/mentions-legales.html` | Legal notice (French law) |
| `/conditions-generales.html` | Terms of sale (CGV) |
| `404.html` | Shown by Vercel for any unknown URL |

## Flight requests

The "Request a Flight" form (`js/booking.js`) sends each request to the Vercel function
`api/flight-request.js`, which emails it in the brand design from **"The Aircrest" <ranimejmal@gmail.com>**:

- **To you:** a "Nouvelle demande de vol" email with every detail; reply to it to write to the client.
- **To the client:** a confirmation in their language (French or English).

**Setup (once):** in Vercel → Project → Settings → **Environment Variables**, add
`GMAIL_USER` = `ranimejmal@gmail.com` and `GMAIL_APP_PASSWORD` = a Google app password
(Google Account → Security → 2-Step Verification on → **App passwords**), then redeploy.
Optional: `NOTIFY_TO` (another inbox for notifications), `SENDER_NAME` (default "The Aircrest").

**Backup:** until those variables exist, or if Gmail refuses to send, the site falls back to FormSubmit
(already activated for ranimejmal@gmail.com), so no request is lost.

"From" and "To" are country dropdowns (`js/countries.js`, popular countries first; edit `POPULAR` to change them).

## Google Sheet of requests (optional)

Every request can also be added as a row in a Google Sheet (date, status, client details, route, dates),
with a status dropdown (Nouvelle / Devis envoyé / Réservée / Perdue / Spam).
Follow the 5 setup steps at the top of `integrations/google-sheet/Code.gs`, then add
`SHEETS_WEBHOOK_URL` and `SHEETS_TOKEN` in Vercel and redeploy.

## WhatsApp

A WhatsApp button (bottom right, both languages) opens a chat with +216 97 017 061 and a pre-filled
message. To change the number, edit the `wa.me/21697017061` link at the end of `index.html` and `fr/index.html`.

## Fleet

The fleet selector is driven by `js/fleet.js`. Edit the `FLEET` list (English) and `FLEET_FR` list (French),
keeping them in the same order. Each aircraft has a tab label, name, two descriptions, six specs and three
cabin dimensions. Figures are indicative manufacturer values; individual aircraft vary by operator.

## Analytics

Vercel Web Analytics is already included on every page (cookieless, no consent banner needed).
Turn it on once in Vercel: Project → **Analytics** → **Enable**.

## Brand

| Role | Color |
|---|---|
| Primary brand (Black Cherry) | `#390B16` |
| Typography, headings, clean surfaces (Pure White) | `#FFFFFF` |
| Deep cinematic backgrounds (Obsidian Black) | `#080608` |
| Secondary light surfaces (Soft White) | `#F5F2F2` |

- **Colors** live in `css/aircrest.webflow.css` and the inline `<style>` blocks in `index.html`.
  Photography is graded to black and white by the `img{filter:grayscale(1)}` rule in the `aircrest-theme` block.
- **Fonts:** Archivo (SIL Open Font License, free for commercial use), self-hosted in `assets/fonts/`.
- **Logo:** `assets/logo/` has the full logo, wordmark and wings emblem in white and Black Cherry
  (SVG, plus PNG for the full logo), the favicons and the link-preview image.

## Still to do

- **Legal details:** fill in every `[À COMPLÉTER]` in `mentions-legales.html` and `conditions-generales.html`
  (company form, capital, address, RCS/SIRET, VAT number, publication director, payment and cancellation
  terms, consumer mediator), then have a French lawyer review them and the privacy policy.
- **Photos:** the photographs (hero window, clouds, jet, cabin plan, benefit photos and globe render) still
  load from the original site's Webflow CDN and belong to its owner. Replace them with your own or licensed
  images. Every other file (scripts, fonts, masks, icons, map) is hosted in this repo (`js/vendor/`, `assets/`).
- **Domain:** connect your domain in Vercel (Project → Settings → Domains), then replace
  `https://theaircrest.vercel.app` in `index.html`, `fr/index.html`, `404.html`, `sitemap.xml`, `robots.txt`
  and `api/flight-request.js`, and submit `sitemap.xml` in Google Search Console.
