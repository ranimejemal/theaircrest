# The Aircrest

Static one-page website for The Aircrest, a private jet charter brand.

Open `index.html` in a browser, or serve the folder with any static host (GitHub Pages, Netlify, Vercel).

## Before going live

- **Images, stylesheet and scripts** are still loaded from the original Webflow CDN (`cdn.prod.website-files.com`). Those photos and files belong to the original site, can disappear at any time, and should be replaced with your own copies.
- **Contact details** are placeholders: `info@theaircrest.com` and `+000 00 000 0000`.
- **Booking form** posts to `https://formspree.io/f/YOUR_FORM_ID`. Create a form on Formspree (or another form service) and put its URL in the form's `action` attribute.
- **Figures** (5K+ flights, 174 countries, home base "Dubai, UAE") came from the original site. Update them with your own numbers.
- **Privacy policy:** `privacy-policy.html` (PDF copy in `assets/`) is based on the UAE PDPL. Replace the placeholder phone number, confirm `privacy@theaircrest.com` exists, and have it reviewed by a lawyer.

## Brand colors — Black Cherry × White

| Role | Color |
|---|---|
| Primary brand (Black Cherry) | `#390B16` |
| Typography, headings, clean surfaces (Pure White) | `#FFFFFF` |
| Deep cinematic backgrounds (Obsidian Black) | `#080608` |
| Secondary light surfaces (Soft White) | `#F5F2F2` |

The colors live in `css/aircrest.webflow.css` (a recolored copy of the Webflow stylesheet) and in the inline `<style>` blocks in `index.html`. The `aircrest-theme` block at the end of `<head>` grades photography to black & white; delete its `img{filter:grayscale(1)}` line to restore the original photo colors.

## Logo

Vector files are in `assets/logo/`, traced from the official artwork:

- `aircrest-logo-full-*`: wordmark with wings
- `aircrest-wordmark-*`: "THEAIRCREST" only (used in the header and hero)
- `aircrest-emblem-*`: wings only (used in the small logo spots)

Each comes in `-white` (for Black Cherry / Obsidian backgrounds) and `-cherry` (for white / Soft White backgrounds), as SVG, plus PNG for the full logo. On the website the logo uses `currentColor`, so it switches between white and Black Cherry with the section it sits on. `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` and `og-image.png` (link previews) are made from it too.
