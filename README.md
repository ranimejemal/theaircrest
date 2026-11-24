# THE AIRCREST

Website for THE AIRCREST, a Paris-based private jet charter broker.
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

The "Request a Flight" form (`js/booking.js`) emails each request to **ranimejmal@gmail.com** through
[FormSubmit](https://formsubmit.co) (free, no account):

1. **One-time activation:** the first request sent from the live site triggers an email from FormSubmit
   to that address. Click **Activate Form** in it. Until then, requests are not delivered.
2. "From" and "To" are country dropdowns (`js/countries.js`, popular countries first; edit `POPULAR` to change them).
   Each email includes name, email, phone, passengers, from, to, dates and the aircraft the visitor
   was viewing in the fleet section. Reply directly to the email to answer the client.
3. To change the receiving address, edit `EMAIL` at the top of `js/booking.js` (it must be activated again).

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
- **Photos:** the photographs (hero window, clouds, jet, cabin and benefit photos) still load from the
  original site's Webflow CDN and belong to its owner. Replace them with your own or licensed images.
- **Domain:** connect your domain in Vercel (Project → Settings → Domains), then update the
  `https://theaircrest.vercel.app` links in the `<head>` of `index.html`, `fr/index.html` and `404.html`.
