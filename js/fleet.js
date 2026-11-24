/* THE AIRCREST — fleet selector
 *
 * To add, remove or change an aircraft, edit the FLEET list below (English)
 * and the FLEET_FR list (French) in the same order.
 * Each entry needs:
 *   tab      short label shown on the selector button
 *   maker    small title (manufacturer + family)
 *   model    big title (model)
 *   sub      heading beside the cabin plan
 *   desc     first paragraph
 *   desc2    second paragraph
 *   specs    six [label, value] pairs
 *   cabin    three [label, value] pairs
 * Figures are indicative manufacturer values; individual aircraft vary by operator.
 */
(function () {
  var FLEET = [
    {
      tab: "Light", maker: "Embraer Phenom", model: "300E", sub: "Light Jet",
      desc: "The best-selling light jet of the last decade: fast, efficient and comfortable for up to 9 guests on regional flights.",
      desc2: "Ideal for business trips and weekend escapes of up to around four hours, such as Paris to Nice, Geneva, London or Ibiza.",
      specs: [["Class", "Light jet"], ["Cruise speed", "≈ 860 km/h"], ["Passengers", "6 to 9 guests"],
              ["Range", "≈ 3,700 km"], ["Baggage", "≈ 2.4 m³"], ["Typical flight", "Up to 4 hours"]],
      cabin: [["Cabin length", "5.2 m"], ["Cabin width", "1.55 m"], ["Cabin height", "1.50 m"]]
    },
    {
      tab: "Midsize", maker: "Cessna Citation", model: "Latitude", sub: "Midsize Jet",
      desc: "A stand-up cabin with a flat floor and wide seats, offering midsize comfort at excellent value for groups of up to 9.",
      desc2: "Comfortable on longer European routes and short transatlantic hops via a fuel stop, with generous room for luggage.",
      specs: [["Class", "Midsize jet"], ["Cruise speed", "≈ 830 km/h"], ["Passengers", "7 to 9 guests"],
              ["Range", "≈ 5,000 km"], ["Baggage", "≈ 3.6 m³"], ["Typical flight", "Up to 6 hours"]],
      cabin: [["Cabin length", "6.6 m"], ["Cabin width", "1.96 m"], ["Cabin height", "1.83 m"]]
    },
    {
      tab: "Super-midsize", maker: "Bombardier Challenger", model: "350", sub: "Super-Midsize Jet",
      desc: "One of the most popular business jets in the world, with a wide cabin, quiet ride and coast-to-coast range.",
      desc2: "Links Paris non-stop with most of Europe, North Africa and the Middle East in spacious, office-like comfort.",
      specs: [["Class", "Super-midsize jet"], ["Cruise speed", "≈ 870 km/h"], ["Passengers", "8 to 10 guests"],
              ["Range", "≈ 5,900 km"], ["Baggage", "≈ 3.0 m³"], ["Typical flight", "Up to 7 hours"]],
      cabin: [["Cabin length", "7.7 m"], ["Cabin width", "2.19 m"], ["Cabin height", "1.83 m"]]
    },
    {
      tab: "Heavy", maker: "Dassault Falcon", model: "900LX", sub: "Heavy Jet",
      desc: "A French-built three-engine jet known for its refined cabin, short-runway capability and outstanding reliability.",
      desc2: "Large enough for families and delegations, with lounge areas and berths for overnight flights across continents.",
      specs: [["Class", "Heavy jet"], ["Cruise speed", "≈ 850 km/h"], ["Passengers", "12 to 14 guests"],
              ["Range", "≈ 8,800 km"], ["Baggage", "≈ 3.6 m³"], ["Typical flight", "Up to 10 hours"]],
      cabin: [["Cabin length", "10.1 m"], ["Cabin width", "2.34 m"], ["Cabin height", "1.88 m"]]
    },
    {
      tab: "Ultra-long-range", maker: "Bombardier Global", model: "7500", sub: "Ultra-Long-Range Jet",
      desc: "The flagship of private aviation: four living spaces, a full-size bed and the range to fly almost anywhere non-stop.",
      desc2: "Paris to Los Angeles, Singapore or Cape Town without a stop, arriving rested in a cabin designed like a private residence.",
      specs: [["Class", "Ultra-long-range jet"], ["Cruise speed", "≈ 950 km/h"], ["Passengers", "Up to 19 guests"],
              ["Range", "≈ 14,200 km"], ["Baggage", "≈ 5.4 m³"], ["Typical flight", "Up to 17 hours"]],
      cabin: [["Cabin length", "16.6 m"], ["Cabin width", "2.44 m"], ["Cabin height", "1.88 m"]]
    }
  ];


  var FLEET_FR = [
    {
      tab: "Léger", maker: "Embraer Phenom", model: "300E", sub: "Jet léger",
      desc: "Le jet léger le plus vendu de la dernière décennie : rapide, sobre et confortable pour 9 passagers maximum sur les vols régionaux.",
      desc2: "Idéal pour les voyages d’affaires et les week-ends jusqu’à environ quatre heures de vol : Paris–Nice, Genève, Londres ou Ibiza.",
      specs: [["Catégorie", "Jet léger"], ["Vitesse de croisière", "≈ 860 km/h"], ["Passagers", "6 à 9"],
              ["Autonomie", "≈ 3 700 km"], ["Bagages", "≈ 2,4 m³"], ["Vol type", "Jusqu’à 4 heures"]],
      cabin: [["Longueur cabine", "5,2 m"], ["Largeur cabine", "1,55 m"], ["Hauteur cabine", "1,50 m"]]
    },
    {
      tab: "Intermédiaire", maker: "Cessna Citation", model: "Latitude", sub: "Jet intermédiaire",
      desc: "Une cabine où l’on se tient debout, un plancher plat et des sièges larges : le confort d’un jet intermédiaire, à un excellent rapport qualité-prix, jusqu’à 9 passagers.",
      desc2: "Confortable sur les longs trajets européens et les traversées de l’Atlantique avec escale, avec un grand volume pour les bagages.",
      specs: [["Catégorie", "Jet intermédiaire"], ["Vitesse de croisière", "≈ 830 km/h"], ["Passagers", "7 à 9"],
              ["Autonomie", "≈ 5 000 km"], ["Bagages", "≈ 3,6 m³"], ["Vol type", "Jusqu’à 6 heures"]],
      cabin: [["Longueur cabine", "6,6 m"], ["Largeur cabine", "1,96 m"], ["Hauteur cabine", "1,83 m"]]
    },
    {
      tab: "Super-intermédiaire", maker: "Bombardier Challenger", model: "350", sub: "Jet super-intermédiaire",
      desc: "L’un des jets d’affaires les plus appréciés au monde, avec une cabine large, un vol silencieux et une grande autonomie.",
      desc2: "Relie Paris sans escale à la plupart des villes d’Europe, d’Afrique du Nord et du Moyen-Orient, dans le confort d’un véritable bureau volant.",
      specs: [["Catégorie", "Jet super-intermédiaire"], ["Vitesse de croisière", "≈ 870 km/h"], ["Passagers", "8 à 10"],
              ["Autonomie", "≈ 5 900 km"], ["Bagages", "≈ 3,0 m³"], ["Vol type", "Jusqu’à 7 heures"]],
      cabin: [["Longueur cabine", "7,7 m"], ["Largeur cabine", "2,19 m"], ["Hauteur cabine", "1,83 m"]]
    },
    {
      tab: "Lourd", maker: "Dassault Falcon", model: "900LX", sub: "Jet lourd",
      desc: "Un triréacteur français réputé pour l’élégance de sa cabine, sa capacité à utiliser des pistes courtes et sa grande fiabilité.",
      desc2: "Assez spacieux pour les familles et les délégations, avec salons et couchettes pour les vols de nuit entre continents.",
      specs: [["Catégorie", "Jet lourd"], ["Vitesse de croisière", "≈ 850 km/h"], ["Passagers", "12 à 14"],
              ["Autonomie", "≈ 8 800 km"], ["Bagages", "≈ 3,6 m³"], ["Vol type", "Jusqu’à 10 heures"]],
      cabin: [["Longueur cabine", "10,1 m"], ["Largeur cabine", "2,34 m"], ["Hauteur cabine", "1,88 m"]]
    },
    {
      tab: "Très long-courrier", maker: "Bombardier Global", model: "7500", sub: "Jet très long-courrier",
      desc: "Le fleuron de l’aviation privée : quatre espaces de vie, un véritable lit et l’autonomie pour rejoindre presque toute destination sans escale.",
      desc2: "Paris–Los Angeles, Singapour ou Le Cap sans escale, pour arriver reposé dans une cabine pensée comme une résidence privée.",
      specs: [["Catégorie", "Jet très long-courrier"], ["Vitesse de croisière", "≈ 950 km/h"], ["Passagers", "Jusqu’à 19"],
              ["Autonomie", "≈ 14 200 km"], ["Bagages", "≈ 5,4 m³"], ["Vol type", "Jusqu’à 17 heures"]],
      cabin: [["Longueur cabine", "16,6 m"], ["Largeur cabine", "2,44 m"], ["Hauteur cabine", "1,88 m"]]
    }
  ];

  var FR_PAGE = (document.documentElement.lang || "").toLowerCase().indexOf("fr") === 0;
  if (FR_PAGE) FLEET = FLEET_FR;
  var OVERVIEW_LABEL = FR_PAGE ? "Toutes" : "All classes";
  var NO_PREF = FR_PAGE ? "Sans préférence" : "No preference";
  var OUR_FLEET = FR_PAGE ? "Notre flotte" : "Our fleet";

  function q(key) { return document.querySelectorAll('[data-fleet="' + key + '"]'); }
  function setText(key, text) { q(key).forEach(function (el) { el.textContent = text; }); }

  function readOverview() {
    function first(key) { var el = q(key)[0]; return el ? el.textContent.trim() : ""; }
    var o = { tab: OVERVIEW_LABEL, maker: first("maker"), model: first("model"), sub: first("sub"),
              desc: first("desc"), desc2: first("desc2"), specs: [], cabin: [], overview: true };
    for (var i = 0; i < 6; i++) o.specs.push([first("sl" + i), first("sv" + i)]);
    for (var j = 0; j < 3; j++) o.cabin.push([first("cl" + j), first("cv" + j)]);
    return o;
  }

  function apply(a) {
    setText("maker", a.maker); setText("model", a.model); setText("sub", a.sub);
    setText("desc", a.desc); setText("desc2", a.desc2);
    a.specs.forEach(function (p, i) { setText("sl" + i, p[0]); setText("sv" + i, p[1]); });
    a.cabin.forEach(function (p, i) { setText("cl" + i, p[0]); setText("cv" + i, p[1]); });
    var field = document.getElementById("Aircraft");
    if (field) field.value = a.overview ? NO_PREF : (a.maker + " " + a.model);
  }

  function init() {
    var holders = document.querySelectorAll(".aircrest-fleet-tabs");
    if (!holders.length) return;
    var list = [readOverview()].concat(FLEET);
    var current = 0;

    function render() {
      holders.forEach(function (h) {
        h.querySelectorAll("button").forEach(function (b, i) {
          var on = i === current;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.tabIndex = on ? 0 : -1;
        });
      });
    }

    holders.forEach(function (h) {
      list.forEach(function (a, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.className = "aircrest-fleet-tab";
        b.textContent = a.tab;
        b.title = a.overview ? OUR_FLEET : a.maker + " " + a.model;
        b.addEventListener("click", function () {
          current = i; apply(list[i]); render();
        });
        b.addEventListener("keydown", function (e) {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          current = (current + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length;
          apply(list[current]); render();
          h.querySelectorAll("button")[current].focus();
        });
        h.appendChild(b);
      });
    });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
