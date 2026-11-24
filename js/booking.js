/* THE AIRCREST — flight request form
 *
 * Main channel: the Vercel function /api/flight-request (api/flight-request.js).
 * It emails you and the client from "The Aircrest" <your Gmail> in the brand design.
 * Backup channel: FormSubmit (formsubmit.co) — used automatically if the function is
 * not configured yet (no Gmail app password) or cannot send, so no request is ever lost.
 */
(function () {
  var API_URL = "/api/flight-request";
  var EMAIL = "ranimejmal@gmail.com";  // FormSubmit backup address
  var FORMSUBMIT = "https://formsubmit.co/ajax/" + EMAIL;

  function frDate(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : (v || ""); }

  function viaApi(raw, lang) {
    return fetch(API_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
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

      viaApi(raw, lang)
        .then(function (res) {
          if (res.success) return res;                                    // emailed from The Aircrest
          if (res.status === 422) throw new Error(res.message || "invalid"); // bad input: show error
          return viaFormSubmit(raw, lang);                                // not configured / failed: backup
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
