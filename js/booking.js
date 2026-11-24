/* THE AIRCREST — flight request form
 * Sends each request by email through FormSubmit (formsubmit.co) and shows the
 * on-page confirmation ticket. To change the receiving address, edit EMAIL.
 * The first request to a new address triggers a one-time activation email
 * from FormSubmit: click "Activate Form" in it, after that requests arrive normally.
 */
(function () {
  var EMAIL = "ranimejmal@gmail.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;

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
      function d(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : (v || ""); }
      var page = (document.documentElement.lang || "en").slice(0, 2) === "fr" ? "Français" : "English";
      // Field names as they appear in the email you receive
      var data = {
        "Nom": raw.Name, "E-mail": raw.Email, "Téléphone": raw.Phone, "Passagers": raw.Passengers,
        "Départ": raw.From, "Arrivée": raw.To,
        "Date de départ": d(raw["Departure-date"]), "Date de retour": d(raw["Return-date"]) || "Aller simple",
        "Appareil consulté": raw.Aircraft, "Langue du site": page
      };
      data._subject = "Nouvelle demande de vol : " + (raw.From || "?") + " → " + (raw.To || "?") +
        (raw["Departure-date"] ? ", le " + d(raw["Departure-date"]) : "");
      data._template = "box";
      data._replyto = raw.Email || "";

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (String(res.success) !== "true") throw new Error(res.message || "not sent");
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
