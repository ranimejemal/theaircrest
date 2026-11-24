// THE AIRCREST — flight request function (Vercel, Node.js)
//
// POST /api/flight-request with the website form as JSON. The function
//   1. validates the request and drops obvious spam,
//   2. emails you a branded notification (reply goes straight to the client), and
//   3. emails the client a confirmation in their language,
// both sent through Gmail as  "The Aircrest" <GMAIL_USER>.
//
// Vercel → Project → Settings → Environment Variables:
//   GMAIL_USER          the Gmail address that sends and receives (ranimejmal@gmail.com)
//   GMAIL_APP_PASSWORD  a Google "app password" for that account (NOT the normal password)
// Optional:
//   NOTIFY_TO           where request notifications go (default: GMAIL_USER)
//   SENDER_NAME         display name on emails (default: The Aircrest)
// While GMAIL_APP_PASSWORD is missing the function answers 503 and the website
// falls back to FormSubmit, so no request is lost.

import nodemailer from "nodemailer";

const env = (k, d = "") => (process.env[k] ?? d).trim();
const SITE = "https://theaircrest.vercel.app";
const LOGO = `${SITE}/assets/logo/aircrest-logo-full-white.png`;
const PHONE = "+33 6 24 97 99 41";
const CHERRY = "#390B16", OBSIDIAN = "#080608", SOFT = "#F5F2F2", MUTED = "#7E7C7D";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (v, max = 200) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const frDate = (v) => (v ? v.split("-").reverse().join("/") : "");

// ------------------------------------------------------------------ email layout
export function layout(title, intro, rows, footer, button) {
  const tr = rows.filter(([, v]) => v).map(([k, v]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E6E1E2;font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};width:42%;vertical-align:top">${esc(k)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #E6E1E2;font:500 15px/1.4 Arial,Helvetica,sans-serif;color:${OBSIDIAN};vertical-align:top">${v}</td>
      </tr>`).join("");
  const btn = button ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="background:${CHERRY};border-radius:999px">
        <a href="${esc(button.href)}" style="display:inline-block;padding:14px 28px;font:600 14px Arial,Helvetica,sans-serif;color:#FFFFFF;text-decoration:none;border-radius:999px">${esc(button.label)}</a>
      </td></tr></table>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:0;background:${SOFT}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT}"><tr><td align="center" style="padding:32px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden">
      <tr><td style="background:${CHERRY};padding:36px 40px 32px" align="left">
        <img src="${LOGO}" width="180" alt="THE AIRCREST" style="display:block;width:180px;height:auto;border:0">
      </td></tr>
      <tr><td style="padding:36px 40px 8px">
        <h1 style="margin:0 0 12px;font:500 26px/1.2 Arial,Helvetica,sans-serif;letter-spacing:-.02em;color:${CHERRY}">${esc(title)}</h1>
        <p style="margin:0 0 20px;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:${OBSIDIAN}">${intro}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tr}</table>
        ${btn}
      </td></tr>
      <tr><td style="padding:24px 40px 32px;font:400 12px/1.6 Arial,Helvetica,sans-serif;color:${MUTED}">${footer}</td></tr>
      <tr><td style="background:${OBSIDIAN};padding:16px 40px;font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#FFFFFF">THE AIRCREST · Paris</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export function validate(b) {
  const r = {
    name: clean(b.name, 120), email: clean(b.email, 160).toLowerCase(), phone: clean(b.phone, 40),
    passengers: Number.parseInt(String(b.passengers ?? ""), 10),
    from: clean(b.from, 120), to: clean(b.to, 120),
    departure: clean(b.departure, 10), ret: clean(b.return, 10),
    aircraft: clean(b.aircraft, 120), lang: clean(b.lang, 5) === "fr" ? "fr" : "en",
  };
  const bad = [];
  if (r.name.length < 2) bad.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(r.email)) bad.push("email");
  if (r.phone.replace(/\D/g, "").length < 6) bad.push("phone");
  if (!(r.passengers >= 1 && r.passengers <= 50)) bad.push("passengers");
  if (!r.from) bad.push("from");
  if (!r.to) bad.push("to");
  if (!isDate(r.departure)) bad.push("departure");
  if (r.ret && (!isDate(r.ret) || r.ret < r.departure)) bad.push("return");
  return { r, bad };
}

export function buildEmails(r, from, notifyTo, when = new Date()) {
  const route = `${r.from} → ${r.to}`;
  const ret = r.ret ? frDate(r.ret) : "";
  const owner = {
    from, to: notifyTo, replyTo: { name: r.name, address: r.email },
    subject: `Nouvelle demande de vol : ${route}, le ${frDate(r.departure)}`,
    text: `Nouvelle demande de vol\n${r.name} · ${r.email} · ${r.phone}\n${route} · ${frDate(r.departure)}${ret ? " → " + ret : ""} · ${r.passengers} passager(s)\nAppareil : ${r.aircraft || "Sans préférence"}`,
    html: layout(
      "Nouvelle demande de vol",
      `${esc(r.name)} souhaite voler de <strong>${esc(r.from)}</strong> à <strong>${esc(r.to)}</strong>.`,
      [
        ["Nom", esc(r.name)],
        ["E-mail", `<a href="mailto:${esc(r.email)}" style="color:${CHERRY}">${esc(r.email)}</a>`],
        ["Téléphone", `<a href="tel:${esc(r.phone.replace(/\s+/g, ""))}" style="color:${CHERRY}">${esc(r.phone)}</a>`],
        ["Passagers", String(r.passengers)],
        ["Départ", esc(r.from)],
        ["Arrivée", esc(r.to)],
        ["Date de départ", frDate(r.departure)],
        ["Date de retour", ret || "Aller simple"],
        ["Appareil consulté", esc(r.aircraft || "Sans préférence")],
        ["Langue du client", r.lang === "fr" ? "Français" : "Anglais"],
      ],
      `Reçue le ${when.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} depuis theaircrest.vercel.app. Répondez à cet e-mail pour écrire directement au client.`,
      { href: `mailto:${r.email}?subject=${encodeURIComponent("THE AIRCREST · " + route)}`, label: "Répondre au client" },
    ),
  };
  const fr = r.lang === "fr";
  const client = {
    from, to: { name: r.name, address: r.email }, replyTo: from,
    subject: fr ? "THE AIRCREST · Votre demande de vol" : "THE AIRCREST · Your flight request",
    text: fr ? `Bonjour ${r.name}, nous avons bien reçu votre demande (${route}). Un conseiller vous recontacte très vite. ${PHONE}`
             : `Dear ${r.name}, we have received your request (${route}). An advisor will be in touch very shortly. ${PHONE}`,
    html: layout(
      fr ? "Votre demande est bien reçue" : "We have received your request",
      fr ? `Bonjour ${esc(r.name)},<br>merci pour votre confiance. Un conseiller THE AIRCREST étudie votre demande et vous recontacte très rapidement avec une proposition d’appareil et de tarif.`
         : `Dear ${esc(r.name)},<br>thank you for your request. A THE AIRCREST advisor is reviewing it and will be in touch very shortly with an aircraft proposal and quote.`,
      fr ? [["Itinéraire", esc(route)], ["Date de départ", frDate(r.departure)], ["Date de retour", ret || "Aller simple"], ["Passagers", String(r.passengers)]]
         : [["Route", esc(route)], ["Departure", frDate(r.departure)], ["Return", ret || "One way"], ["Passengers", String(r.passengers)]],
      fr ? `Une question ? Répondez simplement à cet e-mail ou appelez-nous au ${PHONE}.`
         : `Any question? Simply reply to this email or call us on ${PHONE}.`,
      { href: SITE + (fr ? "/fr/" : "/"), label: fr ? "Découvrir THE AIRCREST" : "Visit THE AIRCREST" },
    ),
  };
  return { owner, client };
}

function transport() {
  if (env("MAIL_TEST") === "1") return nodemailer.createTransport({ jsonTransport: true });
  return nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: env("GMAIL_USER"), pass: env("GMAIL_APP_PASSWORD").replace(/\s+/g, "") },
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ success: false, message: "Method not allowed" }); }

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== "object") return res.status(400).json({ success: false, message: "Invalid JSON" });

  // Honeypot: humans never fill the hidden "website" field. Pretend success to bots.
  if (clean(b.website)) return res.status(200).json({ success: true });

  const { r, bad } = validate(b);
  if (bad.length) return res.status(422).json({ success: false, message: "Invalid fields", fields: bad });

  const user = env("GMAIL_USER");
  if (env("MAIL_TEST") !== "1" && (!user || !env("GMAIL_APP_PASSWORD"))) {
    return res.status(503).json({ success: false, message: "Email not configured" });
  }
  const from = { name: env("SENDER_NAME", "The Aircrest"), address: user || "test@example.com" };
  const { owner, client } = buildEmails(r, from, env("NOTIFY_TO", user));
  const mail = transport();

  try {
    await mail.sendMail(owner);
  } catch (e) {
    console.error("owner email failed:", e && e.message);
    return res.status(502).json({ success: false, message: "Email failed" });
  }
  let clientEmail = true;
  try { await mail.sendMail(client); } catch (e) { clientEmail = false; console.error("client email failed:", e && e.message); }

  return res.status(200).json({ success: true, ownerEmail: true, clientEmail });
}
