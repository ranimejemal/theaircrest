/**
 * THE AIRCREST — flight request log (Google Apps Script)
 *
 * Adds one row per website flight request to the sheet "Demandes".
 *
 * Setup (once, about 5 minutes):
 *  1. Create a Google Sheet named "THE AIRCREST — Demandes de vol".
 *  2. Extensions → Apps Script. Delete the sample code and paste this whole file. Save.
 *  3. Project Settings (gear icon) → Script properties → Add property:
 *       TOKEN = a long random secret you invent (e.g. 32 letters and numbers)
 *  4. Deploy → New deployment → type "Web app":
 *       Execute as: Me    Who has access: Anyone
 *     Authorize, then copy the Web app URL (ends with /exec).
 *  5. In Vercel → Project → Settings → Environment Variables add:
 *       SHEETS_WEBHOOK_URL = the Web app URL
 *       SHEETS_TOKEN       = the same TOKEN as in step 3
 *     then redeploy the site.
 */

const SHEET_NAME = "Demandes";
const HEADERS = ["Reçue le", "Statut", "Nom", "E-mail", "Téléphone", "Passagers", "Départ", "Arrivée",
                 "Date de départ", "Date de retour", "Appareil consulté", "Langue", "Notes"];

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const token = PropertiesService.getScriptProperties().getProperty("TOKEN");
    if (!token || body.token !== token) return out({ ok: false, error: "unauthorized" });

    const sheet = getSheet();
    const r = body.request || {};
    const clip = (v) => String(v == null ? "" : v).slice(0, 200).replace(/^[=+\-@]/, "'$&"); // no formula injection
    sheet.appendRow([
      new Date(), "Nouvelle", clip(r.name), clip(r.email), clip(r.phone), Number(r.passengers) || "",
      clip(r.from), clip(r.to), clip(r.departure), clip(r.ret) || "Aller simple",
      clip(r.aircraft) || "Sans préférence", r.lang === "fr" ? "Français" : "Anglais", ""
    ]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold").setBackground("#390B16").setFontColor("#FFFFFF");
    sh.getRange("A:A").setNumberFormat("dd/mm/yyyy hh:mm");
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Nouvelle", "Devis envoyé", "Réservée", "Perdue", "Spam"], true).build();
    sh.getRange("B2:B").setDataValidation(rule);
    sh.setColumnWidths(1, HEADERS.length, 150);
  }
  return sh;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
