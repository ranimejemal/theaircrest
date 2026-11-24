/* THE AIRCREST — country dropdowns for the flight request form (From / To).
 * Country names come from the browser (Intl.DisplayNames), so they appear in
 * the page language: English on /, French on /fr/.
 * Edit POPULAR to change the countries listed first.
 */
(function () {
  var POPULAR = ["FR", "CH", "MC", "GB", "IT", "ES", "AE", "US", "MA", "TN"];
  var ALL = ("AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA " +
    "CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR " +
    "GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO " +
    "MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY " +
    "PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY " +
    "TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW").split(" ");

  function init() {
    var lang = (document.documentElement.lang || "en").slice(0, 2);
    var fr = lang === "fr";
    var names;
    try { names = new Intl.DisplayNames([lang], { type: "region" }); } catch (e) { names = null; }
    function label(code) { return names ? names.of(code) : code; }

    ["From", "To"].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel || sel.tagName !== "SELECT" || sel.options.length > 1) return;
      function group(title, codes) {
        var g = document.createElement("optgroup");
        g.label = title;
        codes.forEach(function (c) {
          var o = document.createElement("option");
          o.value = label(c); o.textContent = label(c);
          g.appendChild(o);
        });
        sel.appendChild(g);
      }
      var rest = ALL.filter(function (c) { return POPULAR.indexOf(c) < 0; })
        .sort(function (a, b) { return label(a).localeCompare(label(b), lang); });
      group(fr ? "Destinations fréquentes" : "Popular", POPULAR);
      group(fr ? "Tous les pays" : "All countries", rest);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
