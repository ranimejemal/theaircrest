/* THE AIRCREST — flight request form
 *
 * Main channel: the Supabase Edge Function `flight-request` (supabase/functions/flight-request).
 * It saves the request in Supabase and emails you and the client from "The Aircrest".
 * Backup channel: FormSubmit (formsubmit.co) — used only if Supabase cannot be reached
 * or could not send your notification email, so no request is ever lost.
 *
 * SUPABASE_FUNCTION_URL: https://<project-ref>.supabase.co/functions/v1/flight-request
 * Leave it empty to use FormSubmit only.
 */
(function () {
  var SUPABASE_FUNCTION_URL = "";
  var SUPABASE_ANON_KEY = "";          // public "anon" key: safe to publish
  var EMAIL = "ranimejmal@gmail.com";  // FormSubmit backup address
  var FORMSUBMIT = "https://formsubmit.co/ajax/" + EMAIL;

  function frDate(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : (v || ""); }

  function viaSupabase(raw, lang) {
    if (!SUPABASE_FUNCTION_URL) return Promise.reject(new Error("not configured"));
    var headers = { "Content-Type": "application/json" };
    if (SUPABASE_ANON_KEY) { headers.apikey = SUPABASE_ANON_KEY; headers.Authorization = "Bearer " + SUPABASE_ANON_KEY; }
    return fetch(SUPABASE_FUNCTION_URL, {
      method: "POST", headers: headers,
      body: JSON.stringify({
        name: raw.Name, email: raw.Email, phone: raw.Phone, passengers: raw.Passengers,
        from: raw.From, to: raw.To, departure: raw["Departure-date"], "return": raw["Return-date"],
        aircraft: raw.Aircraft, lang: lang, website: raw.website || ""
      })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (res) { res.status = r.status; return res; });
    });
  }

  function viaFormSubmit(raw, lang) {
    var data = {
      "Nom": raw.Name, "E-mail": raw.Email, "Téléphone": raw.Phone, "Passagers": raw.Passengers,
      "Départ": raw.From, "Arrivée": raw.To,
      "Date de départ": frDate(raw["Departure-date"]), "Date de retour": frDate(raw["Return-date"]) || "Aller simple",
      "Appareil consulté": raw.Aircraft, "Langue du site": lang === "fr" ? "Français" : "English",
      _subject: "Nouvelle demande de vol : " + (raw.From || "?") + " → " + (raw.To || "?") +
        (raw["Departure-date"] ? ", le " + frDate(raw["Departure-date"]) : ""),
      _template: "box", _replyto: raw.Email || ""
    };
    return fetch(FORMSUBMIT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) { if (String(res.success) !== "true") throw new Error(res.message || "not sent"); return res; });
  }

  function init() {
    var form = document.getElementById("wf-form-Book-the-Flight");
    if (!form) return;
    var block = form.parentElement;
    var done = block && block.querySelector(".w-form-done");
    var fail = block && block.querySelector(".w-form-fail");
    var sending = false;

    window.addEventListener("submit", function (e) {
      if (e.target !== form) return;
      e.preventDefault();
      e.stopPropagation();
      if (sending) return;
      sending = true;
      if (fail) fail.style.display = "none";

      var raw = {};
      new FormData(form).forEach(function (v, k) { if (k !== "checkbox") raw[k] = String(v).trim(); });
      if (raw.website) { sending = false; return; } // spam bot
      var lang = (document.documentElement.lang || "en").slice(0, 2) === "fr" ? "fr" : "en";

      viaSupabase(raw, lang)
        .then(function (res) {
          if (res.success && res.ownerEmail) return res;                 // saved + you were emailed
          if (res.success) return viaFormSubmit(raw, lang).catch(function () { return res; }); // saved, email backup
          if (res.status === 422 || res.status === 429) throw new Error(res.message || "rejected");
          return viaFormSubmit(raw, lang);                                // Supabase down: backup
        }, function () { return viaFormSubmit(raw, lang); })
        .then(function () {
          form.style.display = "none";
          if (done) done.style.display = "block";
        })
        .catch(function () {
          if (fail) fail.style.display = "block";
        })
        .then(function () { sending = false; });
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
