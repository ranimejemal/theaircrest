// THE AIRCREST — flight request Edge Function (Supabase)
//
// POST JSON from the website form. The function:
//   1. validates the request (and drops obvious spam),
//   2. stores it in public.flight_requests,
//   3. emails the owner a branded notification, and
//   4. emails the client a confirmation in their language,
// both sent through Gmail SMTP as  "The Aircrest" <GMAIL_USER>.
//
// Secrets (Supabase dashboard → Edge Functions → Secrets):
//   GMAIL_USER          the Gmail address that sends and receives, e.g. ranimejmal@gmail.com
//   GMAIL_APP_PASSWORD  a Google "app password" for that account (not the normal password)
// Optional:
//   NOTIFY_TO           where request notifications go (default: GMAIL_USER)
//   SENDER_NAME         display name on emails (default: The Aircrest)
//   ALLOWED_ORIGINS     comma-separated site origins allowed to call this function
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const env = (k: string, d = "") => (Deno.env.get(k) ?? d).trim();

const GMAIL_USER = env("GMAIL_USER");
const GMAIL_APP_PASSWORD = env("GMAIL_APP_PASSWORD").replace(/\s+/g, "");
const NOTIFY_TO = env("NOTIFY_TO", GMAIL_USER);
const SENDER_NAME = env("SENDER_NAME", "The Aircrest");
const ALLOWED = env("ALLOWED_ORIGINS", "https://theaircrest.vercel.app,http://localhost:8765")
  .split(",").map((s) => s.trim()).filter(Boolean);

const SITE = "https://theaircrest.vercel.app";
const LOGO = `${SITE}/assets/logo/aircrest-logo-full-white.png`;
const PHONE = "+33 6 24 97 99 41";

const CHERRY = "#390B16", OBSIDIAN = "#080608", SOFT = "#F5F2F2", MUTED = "#7E7C7D";

function cors(origin: string | null) {
  const allow = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const clean = (v: unknown, max = 200) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
const frDate = (v: string | null) => v ? v.split("-").reverse().join("/") : "";

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// ------------------------------------------------------------------ email layout
function layout(title: string, intro: string, rows: [string, string][], footer: string, button?: { href: string; label: string }) {
  const tr = rows.filter(([, v]) => v).map(([k, v]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E6E1E2;font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};width:42%;vertical-align:top">${esc(k)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #E6E1E2;font:500 15px/1.4 Arial,Helvetica,sans-serif;color:${OBSIDIAN};vertical-align:top">${v}</td>
      </tr>`).join("");
  const btn = button ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="background:${CHERRY};border-radius:999px">
        <a href="${esc(button.href)}" style="display:inline-block;padding:14px 28px;font:600 14px Arial,Helvetica,sans-serif;color:#FFFFFF;text-decoration:none;border-radius:999px">${esc(button.label)}</a>
      </td></tr></table>` : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:${SOFT}">
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

// ------------------------------------------------------------------ handler
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ success: false, message: "Method not allowed" }, 405, origin);
  if (origin && !ALLOWED.includes(origin)) return json({ success: false, message: "Origin not allowed" }, 403, origin);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ success: false, message: "Invalid JSON" }, 400, origin); }

  // Honeypot: humans never fill the hidden "website" field. Pretend success to bots.
  if (clean(b.website)) return json({ success: true }, 200, origin);

  const r = {
    name: clean(b.name, 120), email: clean(b.email, 160).toLowerCase(), phone: clean(b.phone, 40),
    passengers: Number.parseInt(String(b.passengers ?? ""), 10),
    from_place: clean(b.from, 120), to_place: clean(b.to, 120),
    departure_date: clean(b.departure, 10), return_date: clean(b.return, 10),
    aircraft: clean(b.aircraft, 120), lang: clean(b.lang, 5) === "fr" ? "fr" : "en",
  };
  const bad: string[] = [];
  if (r.name.length < 2) bad.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(r.email)) bad.push("email");
  if (r.phone.replace(/\D/g, "").length < 6) bad.push("phone");
  if (!(r.passengers >= 1 && r.passengers <= 50)) bad.push("passengers");
  if (!r.from_place) bad.push("from");
  if (!r.to_place) bad.push("to");
  if (!isDate(r.departure_date)) bad.push("departure");
  if (r.return_date && (!isDate(r.return_date) || r.return_date < r.departure_date)) bad.push("return");
  if (bad.length) return json({ success: false, message: "Invalid fields", fields: bad }, 422, origin);

  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

  // Light rate limit: max 5 requests per address per hour.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ipHash = ip ? await sha256(ip + "|aircrest") : null;
  if (ipHash) {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("flight_requests").select("id", { count: "exact", head: true })
      .eq("client_ip_hash", ipHash).gte("created_at", since);
    if ((count ?? 0) >= 5) return json({ success: false, message: "Too many requests" }, 429, origin);
  }

  const { data: row, error } = await db.from("flight_requests").insert({
    ...r, return_date: r.return_date || null, aircraft: r.aircraft || null, client_ip_hash: ipHash,
  }).select("id, created_at").single();
  if (error) {
    console.error("insert failed", error);
    return json({ success: false, message: "Could not save request" }, 500, origin);
  }

  // ---------------------------------------------------------------- emails
  const route = `${r.from_place} → ${r.to_place}`;
  const ret = r.return_date ? frDate(r.return_date) : "";
  let ownerSent = false, clientSent = false;

  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    const smtp = new SMTPClient({
      connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD } },
    });
    const from = `${SENDER_NAME} <${GMAIL_USER}>`;
    try {
      const owner = layout(
        "Nouvelle demande de vol",
        `${esc(r.name)} souhaite voler de <strong>${esc(r.from_place)}</strong> à <strong>${esc(r.to_place)}</strong>.`,
        [
          ["Nom", esc(r.name)],
          ["E-mail", `<a href="mailto:${esc(r.email)}" style="color:${CHERRY}">${esc(r.email)}</a>`],
          ["Téléphone", `<a href="tel:${esc(r.phone.replace(/\s+/g, ""))}" style="color:${CHERRY}">${esc(r.phone)}</a>`],
          ["Passagers", String(r.passengers)],
          ["Départ", esc(r.from_place)],
          ["Arrivée", esc(r.to_place)],
          ["Date de départ", frDate(r.departure_date)],
          ["Date de retour", ret || "Aller simple"],
          ["Appareil consulté", esc(r.aircraft || "Sans préférence")],
          ["Langue du client", r.lang === "fr" ? "Français" : "Anglais"],
        ],
        `Demande n° ${esc(String(row.id).slice(0, 8))} · reçue le ${new Date(row.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}. Toutes les demandes sont enregistrées dans Supabase (table flight_requests).`,
        { href: `mailto:${r.email}?subject=${encodeURIComponent("THE AIRCREST · " + route)}`, label: "Répondre au client" },
      );
      await smtp.send({
        from, to: NOTIFY_TO, replyTo: `${r.name} <${r.email}>`,
        subject: `Nouvelle demande de vol : ${route}, le ${frDate(r.departure_date)}`,
        content: `Nouvelle demande de vol\n${r.name} · ${r.email} · ${r.phone}\n${route} · ${frDate(r.departure_date)}${ret ? " → " + ret : ""} · ${r.passengers} passager(s)`,
        html: owner,
      });
      ownerSent = true;

      const fr = r.lang === "fr";
      const client = layout(
        fr ? "Votre demande est bien reçue" : "We have received your request",
        fr
          ? `Bonjour ${esc(r.name)},<br>merci pour votre confiance. Un conseiller THE AIRCREST étudie votre demande et vous recontacte très rapidement avec une proposition d’appareil et de tarif.`
          : `Dear ${esc(r.name)},<br>thank you for your request. A THE AIRCREST advisor is reviewing it and will be in touch very shortly with an aircraft proposal and quote.`,
        fr
          ? [["Itinéraire", esc(route)], ["Date de départ", frDate(r.departure_date)], ["Date de retour", ret || "Aller simple"], ["Passagers", String(r.passengers)]]
          : [["Route", esc(route)], ["Departure", frDate(r.departure_date)], ["Return", ret || "One way"], ["Passengers", String(r.passengers)]],
        fr
          ? `Une question ? Répondez simplement à cet e-mail ou appelez-nous au ${PHONE}.`
          : `Any question? Simply reply to this email or call us on ${PHONE}.`,
        { href: SITE + (fr ? "/fr/" : "/"), label: fr ? "Découvrir THE AIRCREST" : "Visit THE AIRCREST" },
      );
      await smtp.send({
        from, to: r.email, replyTo: from,
        subject: fr ? "THE AIRCREST · Votre demande de vol" : "THE AIRCREST · Your flight request",
        content: fr ? `Bonjour ${r.name}, nous avons bien reçu votre demande (${route}). Nous vous recontactons très vite. ${PHONE}`
                    : `Dear ${r.name}, we have received your request (${route}) and will be in touch very shortly. ${PHONE}`,
        html: client,
      });
      clientSent = true;
    } catch (e) {
      console.error("email failed", e);
    } finally {
      try { await smtp.close(); } catch { /* ignore */ }
    }
  } else {
    console.error("GMAIL_USER / GMAIL_APP_PASSWORD secrets are not set: request saved, no email sent");
  }

  await db.from("flight_requests").update({ owner_email_sent: ownerSent, client_email_sent: clientSent }).eq("id", row.id);

  // Saved is success for the visitor; ownerEmail tells the site whether to use the backup channel.
  return json({ success: true, id: row.id, ownerEmail: ownerSent }, 200, origin);
});
