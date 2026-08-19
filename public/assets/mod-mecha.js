/* ============================================================================
   MECHATRONIK-HUB · gemeinsames Modul-Skript
   Alle Module des Mechatronik-Hubs und die Technik-Module der Werkstatt laden
   diese Datei. Jeder Baustein prueft zuerst, ob seine Elemente auf der Seite
   ueberhaupt vorkommen — was fehlt, kostet nichts. Inhalte stehen im HTML
   (Pagefind-Volltext, Betrieb ohne JS); hier liegt nur Verhalten: Falten,
   Filtern, Sortieren, Rechnen, Simulieren.
   ========================================================================== */
(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var num = function (v) { var x = parseFloat(String(v).replace(",", ".")); return isFinite(x) ? x : NaN; };
var norm = function (s) {
  return (s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
};

/* Zahl lesbar runden: 3 signifikante Stellen, aber keine krummen Nullen. */
function sig(x, n) {
  if (!isFinite(x)) return "—";
  n = n || 3;
  var a = Math.abs(x);
  if (a === 0) return "0";
  if (a >= 1e6 || a < 1e-4) return x.toExponential(n - 1).replace("e", "·10^");
  return String(parseFloat(x.toPrecision(n)));
}
/* Wert mit SI-Vorsatz, z. B. 0.000047 F -> 47 µF */
function si(x, unit) {
  if (!isFinite(x)) return "—";
  var p = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
  var a = Math.abs(x);
  for (var i = 0; i < p.length; i++) {
    if (a >= p[i][0] || i === p.length - 1) return sig(x / p[i][0]) + " " + p[i][1] + (unit || "");
  }
  return sig(x) + " " + (unit || "");
}

/* ==========================================================================
   1 · FALTABSCHNITTE
   Lange Tabs bekommen aufklappbare Kapitel. Erst ab vier Ueberschriften,
   sonst zerfaellt ein kurzer Abschnitt in Krimskrams.
   ========================================================================== */
(function () {
  var MIN = 5;
  function build(sec) {
    if (!sec || sec.dataset.folded) return;
    var TAG = "H2";
    var hs = $$(":scope > h2", sec).filter(function (h) { return !h.classList.contains("msec-t"); });
    if (hs.length < MIN) {
      var h3 = $$(":scope > h3", sec);
      if (h3.length >= 4) { TAG = "H3"; hs = h3; }
    }
    if (hs.length < 4) { sec.dataset.folded = "no"; return; }
    sec.dataset.folded = "yes";
    hs.forEach(function (h, i) {
      var body = document.createElement("div");
      body.className = "sec-body" + (i === 0 ? " open" : "");
      var n = h.nextSibling;
      while (n && !(n.nodeType === 1 && n.tagName === TAG)) { var nx = n.nextSibling; body.appendChild(n); n = nx; }
      h.after(body);
      h.classList.add("fold");
      if (i === 0) h.classList.add("open");
      h.setAttribute("role", "button");
      h.setAttribute("tabindex", "0");
      var tog = function () { h.classList.toggle("open"); body.classList.toggle("open"); };
      h.addEventListener("click", tog);
      h.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tog(); }
      });
    });
    var bar = document.createElement("div");
    bar.className = "foldbar";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Alle aufklappen";
    btn.onclick = function () {
      var allOpen = hs.every(function (h) { return h.classList.contains("open"); });
      hs.forEach(function (h) {
        h.classList.toggle("open", !allOpen);
        var b = h.nextElementSibling;
        if (b && b.classList.contains("sec-body")) b.classList.toggle("open", !allOpen);
      });
      btn.textContent = allOpen ? "Alle aufklappen" : "Alle zuklappen";
    };
    bar.appendChild(btn);
    sec.insertBefore(bar, sec.firstChild);
  }
  window.__openSection = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var h = el.classList && el.classList.contains("fold")
      ? el
      : (el.closest(".sec-body") || {}).previousElementSibling;
    if (h && h.classList && h.classList.contains("fold") && !h.classList.contains("open")) {
      h.classList.add("open");
      var b = h.nextElementSibling;
      if (b && b.classList.contains("sec-body")) b.classList.add("open");
    }
    var box = el.closest(".sec-body");
    if (box && !box.classList.contains("open")) {
      box.classList.add("open");
      var ph = box.previousElementSibling;
      if (ph && ph.classList.contains("fold")) ph.classList.add("open");
    }
  };
  $$(".msec").forEach(build);
})();

/* ==========================================================================
   2 · TABELLEN
   Spaltennamen an jede Zelle haengen (Kartenansicht auf dem Handy) und
   Zahlenzellen markieren. Zusaetzlich: Sortieren ueber th[data-s].
   ========================================================================== */
window.__prepTables = function (root) {
  $$("table", root || document).forEach(function (tb) {
    var th = $$("thead th", tb).map(function (x) { return x.textContent.replace(/\s+/g, " ").trim(); });
    $$("tbody tr", tb).forEach(function (tr) {
      Array.prototype.slice.call(tr.children).forEach(function (td, i) {
        if (!td.hasAttribute("colspan") && th[i]) td.setAttribute("data-l", th[i]);
        var t = td.textContent.trim();
        if (i > 0 && t.length <= 26 && /\d/.test(t) && t.split(" ").length <= 5) td.classList.add("numcell");
        else td.classList.remove("numcell");
      });
    });
  });
};
window.__prepTables();

(function () {
  function keyOf(tr, i, kind) {
    var td = tr.children[i];
    var t = td ? td.textContent.trim() : "";
    if (kind === "num") {
      var m = t.replace(/\./g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
      return m ? parseFloat(m[0]) : -Infinity;
    }
    return norm(t);
  }
  $$("table").forEach(function (tb) {
    var ths = $$("thead th[data-s]", tb);
    if (!ths.length) return;
    ths.forEach(function (th) {
      var span = document.createElement("span");
      span.className = "ar";
      th.appendChild(span);
      th.addEventListener("click", function () {
        var idx = Array.prototype.indexOf.call(th.parentElement.children, th);
        var dir = th.dataset.dir === "1" ? -1 : 1;
        $$("thead th[data-s]", tb).forEach(function (o) {
          o.dataset.dir = "";
          o.querySelector(".ar").textContent = "";
        });
        th.dataset.dir = dir === 1 ? "1" : "-1";
        span.textContent = dir === 1 ? "▲" : "▼";
        var body = tb.tBodies[0];
        var rows = $$("tr", body).filter(function (r) { return !r.querySelector("td[colspan]"); });
        rows.sort(function (a, b) {
          var x = keyOf(a, idx, th.dataset.s), y = keyOf(b, idx, th.dataset.s);
          return x < y ? -dir : x > y ? dir : 0;
        });
        rows.forEach(function (r) { body.appendChild(r); });
      });
    });
  });
})();

/* ==========================================================================
   3 · KATALOGE  (Komponenten, Sensoren, Tools, Webseiten, Bücher, Glossar)
   Ein Container [data-list] mit Eintraegen [data-item]. Jeder Eintrag traegt
   data-cat (Kategorie) und optional data-a (Anfangsbuchstabe fuers Glossar).
   Gesucht wird ueber den sichtbaren Text plus data-k (Stichwoerter).
   ========================================================================== */
$$("[data-list]").forEach(function (list) {
  var scope = list.closest("[data-scope]") || list.parentElement;
  var items = $$("[data-item]", list);
  var input = $("[data-search]", scope);
  var count = $("[data-count]", scope);
  var cats = $$("[data-filter]", scope);
  var abc = $("[data-abc]", scope);
  var activeCat = "all", activeLetter = "";

  items.forEach(function (it) {
    it.dataset.hay = norm(it.textContent + " " + (it.dataset.k || "") + " " + (it.dataset.cat || ""));
  });

  /* Alphabet-Leiste aus den vorhandenen Anfangsbuchstaben bauen */
  if (abc) {
    var have = {};
    items.forEach(function (it) { if (it.dataset.a) have[it.dataset.a.toUpperCase()] = 1; });
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat(["0-9"]);
    var all = document.createElement("button");
    all.type = "button"; all.textContent = "*"; all.className = "active"; all.dataset.l = "";
    all.style.width = "auto"; all.style.padding = "0 9px";
    abc.appendChild(all);
    letters.forEach(function (L) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = L; b.dataset.l = L;
      if (!have[L]) b.disabled = true;
      abc.appendChild(b);
    });
    abc.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || b.disabled) return;
      activeLetter = b.dataset.l;
      $$("button", abc).forEach(function (o) { o.classList.toggle("active", o === b); });
      render();
    });
  }

  function render() {
    var q = norm(input ? input.value : "");
    var n = 0, lastSec = null, secShown = {};
    items.forEach(function (it) {
      var ok = (activeCat === "all" || it.dataset.cat === activeCat)
        && (!activeLetter || (it.dataset.a || "").toUpperCase() === activeLetter)
        && (!q || it.dataset.hay.indexOf(q) >= 0);
      it.hidden = !ok;
      if (ok) { n++; if (it.dataset.a) secShown[it.dataset.a.toUpperCase()] = 1; }
    });
    /* Gruppenkoepfe (Glossar) nur zeigen, wenn darunter noch etwas steht */
    $$(".gsec", list).forEach(function (s) { s.hidden = !secShown[(s.dataset.a || s.textContent).trim().toUpperCase()]; });
    if (count) count.textContent = n + " von " + items.length + (list.dataset.list ? " " + list.dataset.list : " Einträgen");
    var none = $("[data-none]", scope);
    if (none) none.hidden = n > 0;
    void lastSec;
  }

  if (input) input.addEventListener("input", render);
  cats.forEach(function (b) {
    b.addEventListener("click", function () {
      activeCat = b.dataset.filter;
      cats.forEach(function (o) { o.classList.toggle("active", o === b); });
      render();
    });
  });
  /* Detailzeile aufklappen */
  list.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var it = e.target.closest("[data-item]");
    if (!it) return;
    var det = $(".det", it);
    if (det) det.hidden = !det.hidden;
  });
  render();
});

/* ==========================================================================
   4 · RECHNER
   Markup: .calc[data-calc="name"] mit Feldern [data-k], Ausgabe [data-out],
   Erlaeuterung [data-hint]. Jede Funktion bekommt die Werte als Objekt und
   liefert {out, hint}.
   ========================================================================== */
var CALC = {
  /* --- Ohmsches Gesetz + Leistung: zwei Werte genuegen --- */
  ohm: function (v) {
    var u = v.u, i = v.i, r = v.r, p = v.p;
    var known = [u, i, r, p].filter(function (x) { return isFinite(x); }).length;
    if (known < 2) return { out: "Zwei Werte eintragen — der Rest ergibt sich." };
    if (!isFinite(u)) u = isFinite(i) && isFinite(r) ? i * r : isFinite(p) && isFinite(i) ? p / i : Math.sqrt(p * r);
    if (!isFinite(i)) i = isFinite(r) ? u / r : p / u;
    if (!isFinite(r)) r = u / i;
    if (!isFinite(p)) p = u * i;
    return {
      out: "U = " + si(u, "V") + " · I = " + si(i, "A") + " · R = " + si(r, "Ω") + " · P = " + si(p, "W"),
      hint: "Verlustleistung am Widerstand: " + si(p, "W") + ". Faustregel: Bauteil mit mindestens der doppelten "
        + "Nennleistung wählen (" + si(p * 2, "W") + "), sonst wird es im Dauerbetrieb zu heiß."
    };
  },
  /* --- Spannungsteiler mit Last --- */
  teiler: function (v) {
    if (!isFinite(v.uin) || !isFinite(v.r1) || !isFinite(v.r2)) return { out: "U_ein, R1 und R2 eintragen." };
    var uo = v.uin * v.r2 / (v.r1 + v.r2);
    var iq = v.uin / (v.r1 + v.r2);
    var s = "U_aus = " + si(uo, "V") + "  ·  Querstrom = " + si(iq, "A");
    var hint = "Der Teiler zieht dauernd " + si(iq, "A") + " (" + si(v.uin * iq, "W") + " Verlust). ";
    if (isFinite(v.rl)) {
      var rp = (v.r2 * v.rl) / (v.r2 + v.rl);
      var ul = v.uin * rp / (v.r1 + rp);
      s += "  ·  mit Last: " + si(ul, "V");
      hint += "Die Last von " + si(v.rl, "Ω") + " liegt parallel zu R2 und drückt die Ausgangsspannung um "
        + sig(100 * (uo - ul) / uo, 2) + " % nach unten. ";
    }
    hint += "Regel: R2 höchstens ein Zehntel des Lastwiderstands, sonst bricht der Teiler ein.";
    return { out: s, hint: hint };
  },
  /* --- RC / RL: Zeitkonstante und Grenzfrequenz --- */
  rc: function (v) {
    var r = v.r, c = v.c ? v.c * 1e-6 : NaN, l = v.l ? v.l * 1e-3 : NaN;
    if (isFinite(r) && isFinite(c)) {
      var tau = r * c, fg = 1 / (2 * Math.PI * tau);
      return {
        out: "τ = " + si(tau, "s") + "  ·  f_g = " + si(fg, "Hz") + "  ·  5τ = " + si(5 * tau, "s"),
        hint: "Nach τ ist der Kondensator auf 63 % geladen, nach 3τ auf 95 %, nach 5τ auf 99,3 % — "
          + "praktisch voll. Bei f_g ist die Amplitude auf 70,7 % (−3 dB) gefallen, die Phase um 45° gedreht. "
          + "Als Entprellglied an einem Taster: τ ≈ 10 ms ist ein guter Startwert."
      };
    }
    if (isFinite(r) && isFinite(l)) {
      var t2 = l / r, f2 = r / (2 * Math.PI * l);
      return { out: "τ = " + si(t2, "s") + "  ·  f_g = " + si(f2, "Hz"),
        hint: "Bei einer Spule steigt der Strom mit τ = L/R. Beim Abschalten entsteht eine Spannungsspitze — "
          + "Freilaufdiode nicht vergessen." };
    }
    return { out: "R und dazu C (µF) oder L (mH) eintragen." };
  },
  /* --- Impedanz eines RLC-Zweigs bei einer Frequenz --- */
  impedanz: function (v) {
    var f = v.f;
    if (!isFinite(f) || f <= 0) return { out: "Frequenz eintragen." };
    var w = 2 * Math.PI * f;
    var r = isFinite(v.r) ? v.r : 0;
    var xl = isFinite(v.l) ? w * v.l * 1e-3 : 0;
    var xc = isFinite(v.c) && v.c > 0 ? 1 / (w * v.c * 1e-6) : 0;
    var x = xl - xc;
    var z = Math.sqrt(r * r + x * x);
    var phi = Math.atan2(x, r) * 180 / Math.PI;
    var res = (isFinite(v.l) && isFinite(v.c) && v.l > 0 && v.c > 0)
      ? 1 / (2 * Math.PI * Math.sqrt(v.l * 1e-3 * v.c * 1e-6)) : NaN;
    return {
      out: "X_L = " + si(xl, "Ω") + "  ·  X_C = " + si(xc, "Ω") + "  ·  |Z| = " + si(z, "Ω")
        + "  ·  φ = " + sig(phi, 3) + "°",
      hint: (isFinite(res) ? "Resonanzfrequenz der Reihenschaltung: " + si(res, "Hz") + ". " : "")
        + "Positives φ heißt induktiv (Strom eilt nach), negatives kapazitiv (Strom eilt vor). "
        + "Bei φ = 0 ist der Zweig rein ohmsch — genau die Resonanz."
    };
  },
  /* --- Dezibel --- */
  db: function (v) {
    if (isFinite(v.db)) {
      return { out: "Spannungsverhältnis = " + sig(Math.pow(10, v.db / 20), 4)
        + "  ·  Leistungsverhältnis = " + sig(Math.pow(10, v.db / 10), 4),
        hint: "Merkpunkte: 3 dB = doppelte Leistung, 6 dB = doppelte Spannung, 20 dB = Faktor 10 in der Spannung." };
    }
    if (isFinite(v.f)) {
      return { out: "als Spannung: " + sig(20 * Math.log10(v.f), 4) + " dB  ·  als Leistung: "
        + sig(10 * Math.log10(v.f), 4) + " dB",
        hint: "Spannungen und Ströme mit 20·log, Leistungen mit 10·log — die Verwechslung ist der häufigste Fehler." };
    }
    return { out: "Entweder dB oder Faktor eintragen." };
  },
  /* --- Zahlensysteme + Zweierkomplement --- */
  zahlen: function (v, el) {
    var raw = ($("[data-k='wert']", el) || {}).value || "";
    var base = ($("[data-k='basis']", el) || {}).value || "10";
    var bits = parseInt((($("[data-k='bits']", el) || {}).value || "8"), 10);
    raw = raw.trim().replace(/^0[xXbB]/, "").replace(/\s+/g, "");
    if (!raw) return { out: "Zahl eintragen." };
    var n = parseInt(raw, parseInt(base, 10));
    if (!isFinite(n)) return { out: "Das ist in Basis " + base + " keine gültige Zahl." };
    var mask = bits >= 32 ? 0xFFFFFFFF : (1 << bits) - 1;
    var u = n < 0 ? (n >>> 0) & mask : n & mask;
    var signed = (u & (1 << (bits - 1))) ? u - Math.pow(2, bits) : u;
    var bin = u.toString(2).padStart(bits, "0").replace(/(.{4})(?=.)/g, "$1 ");
    return {
      out: "dez " + u + "  ·  hex 0x" + u.toString(16).toUpperCase().padStart(bits / 4, "0")
        + "  ·  okt 0o" + u.toString(8) + "  ·  bin " + bin,
      hint: "Als vorzeichenbehaftete " + bits + "-Bit-Zahl (Zweierkomplement): " + signed
        + ". Wertebereich: −" + Math.pow(2, bits - 1) + " … " + (Math.pow(2, bits - 1) - 1)
        + ", vorzeichenlos 0 … " + (Math.pow(2, bits) - 1) + "."
    };
  },
  /* --- Abtastung & ADC --- */
  adc: function (v) {
    var b = v.bits, ref = v.ref, fs = v.fs;
    if (!isFinite(b) || !isFinite(ref)) return { out: "Auflösung und Referenzspannung eintragen." };
    var steps = Math.pow(2, b);
    var lsb = ref / steps;
    var snr = 6.02 * b + 1.76;
    var s = "Stufen = " + steps + "  ·  1 LSB = " + si(lsb, "V") + "  ·  ideales SNR = " + sig(snr, 4) + " dB";
    var hint = "Das ideale SNR gilt nur für ein Vollaussteuerungs-Sinussignal und rein rechnerisches "
      + "Quantisierungsrauschen — reale Wandler liegen darunter (ENOB im Datenblatt).";
    if (isFinite(fs)) {
      s += "  ·  Nutzbandbreite ≤ " + si(fs / 2, "Hz");
      hint += " Bei " + si(fs, "Hz") + " Abtastrate liegt die Nyquist-Grenze bei " + si(fs / 2, "Hz")
        + ": alles darüber faltet sich als Alias in das Nutzband und muss vorher analog weggefiltert werden.";
    }
    return { out: s, hint: hint };
  },
  /* --- Leiterbahnbreite nach IPC-2221 --- */
  trace: function (v) {
    var i = v.i, dt = v.dt, cu = v.cu, lay = (v.lay === 1 || v.lay === undefined) ? 1 : v.lay;
    var innen = ($("[data-k='innen']", document) || {}).value;
    void innen;
    if (!isFinite(i) || !isFinite(dt) || !isFinite(cu)) return { out: "Strom, Temperaturanstieg und Kupferdicke eintragen." };
    var k = lay === 0 ? 0.024 : 0.048;                 /* innen : aussen */
    var area = Math.pow(i / (k * Math.pow(dt, 0.44)), 1 / 0.725);  /* in mil² */
    var thickMil = cu * 1.378;                          /* 1 oz ≈ 1,378 mil ≈ 35 µm */
    var wMil = area / thickMil;
    var wMm = wMil * 0.0254;
    return {
      out: "Mindestbreite ≈ " + sig(wMm, 3) + " mm  (" + sig(wMil, 3) + " mil)",
      hint: "Nach IPC-2221 für " + (lay === 0 ? "Innenlagen" : "Außenlagen") + " bei " + cu + " oz Kupfer "
        + "und " + dt + " K Erwärmung. IPC-2221 stammt aus den 1950er-Jahren und ist bewusst konservativ; "
        + "IPC-2152 rechnet mit modernen Messdaten und berücksichtigt Kupferflächen in der Nachbarschaft. "
        + "Für alles über 3 A oder dicht gepackte Lagen mit IPC-2152 gegenrechnen."
    };
  },
  /* --- PID-Einstellregeln --- */
  pid: function (v, el) {
    var m = ($("[data-k='verfahren']", el) || {}).value || "zn-schwing";
    var typ = ($("[data-k='typ']", el) || {}).value || "pid";
    var out, hint;
    if (m === "zn-schwing") {
      var ku = v.ku, tu = v.tu;
      if (!isFinite(ku) || !isFinite(tu)) return { out: "Kritische Verstärkung K_krit und Periodendauer T_krit eintragen." };
      var t = { p: [0.5 * ku, 0, 0], pi: [0.45 * ku, 0.85 * tu, 0], pid: [0.6 * ku, 0.5 * tu, 0.12 * tu] }[typ];
      out = "K_p = " + sig(t[0], 4) + (t[1] ? "  ·  T_n = " + sig(t[1], 4) + " s" : "")
        + (t[2] ? "  ·  T_v = " + sig(t[2], 4) + " s" : "");
      hint = "Ziegler-Nichols, Schwingungsmethode (1942): I- und D-Anteil abschalten, K_p erhöhen, bis der Kreis "
        + "gerade dauerschwingt. Das Ergebnis ist absichtlich schnell und schwingt typisch mit rund 25 % Überschwingen "
        + "nach — als Startwert gut, als Endwert selten. Vorsicht: der Versuch fährt die Anlage an die Stabilitätsgrenze.";
    } else {
      var tg = v.tg, tvz = v.tvz, ks = isFinite(v.ks) ? v.ks : 1;
      if (!isFinite(tg) || !isFinite(tvz)) return { out: "Verzugszeit T_u und Ausgleichszeit T_g aus der Sprungantwort eintragen." };
      var q = tg / (ks * tvz);
      var tab = {
        "zn-sprung": { p: [q, 0, 0], pi: [0.9 * q, 3.33 * tvz, 0], pid: [1.2 * q, 2 * tvz, 0.5 * tvz] },
        "chr-fuehrung": { p: [0.3 * q, 0, 0], pi: [0.35 * q, 1.2 * tg, 0], pid: [0.6 * q, tg, 0.5 * tvz] },
        "chr-stoerung": { p: [0.3 * q, 0, 0], pi: [0.6 * q, 4 * tvz, 0], pid: [0.95 * q, 2.4 * tvz, 0.42 * tvz] }
      }[m];
      var r = tab[typ];
      out = "K_p = " + sig(r[0], 4) + (r[1] ? "  ·  T_n = " + sig(r[1], 4) + " s" : "")
        + (r[2] ? "  ·  T_v = " + sig(r[2], 4) + " s" : "");
      hint = (m === "zn-sprung"
        ? "Ziegler-Nichols aus der Sprungantwort: Wendetangente anlegen, T_u und T_g ablesen. Schnell, aber schwingfreudig."
        : "Chien/Hrones/Reswick (1952) trennt zwischen Führungs- und Störverhalten. "
          + (m === "chr-fuehrung" ? "Diese Zeile ist auf Sollwertsprünge ohne Überschwingen ausgelegt."
            : "Diese Zeile ist auf schnelles Ausregeln von Störungen ausgelegt."))
        + " Faustregel für alle Verfahren: T_u/T_g über 0,3 heißt schwer regelbar — dann hilft nur ein besseres "
        + "Streckenmodell, eine Vorsteuerung oder ein Smith-Prädiktor.";
    }
    return { out: out, hint: hint };
  },
  /* --- Antrieb: Drehmoment, Leistung, Getriebe --- */
  antrieb: function (v) {
    var f = v.f, r = v.r, n = v.n, ig = isFinite(v.ig) ? v.ig : 1, eta = isFinite(v.eta) ? v.eta / 100 : 0.85;
    if (!isFinite(f) || !isFinite(r)) return { out: "Kraft und Radius (bzw. Hebelarm) eintragen." };
    var M = f * r / 1000;                       /* r in mm -> Nm */
    var Mmot = M / (ig * eta);
    var s = "Abtriebsmoment = " + sig(M, 3) + " Nm  ·  nötiges Motormoment = " + sig(Mmot, 3) + " Nm";
    var hint = "Bei Getriebefaktor " + ig + ":1 und " + Math.round(eta * 100) + " % Wirkungsgrad. ";
    if (isFinite(n)) {
      var w = 2 * Math.PI * n / 60;
      var P = M * w;
      s += "  ·  Leistung = " + sig(P, 3) + " W";
      hint += "Bei " + n + " min⁻¹ am Abtrieb dreht der Motor mit " + sig(n * ig, 4) + " min⁻¹. "
        + "Mechanische Leistung P = M·ω, elektrisch braucht es entsprechend mehr. ";
    }
    hint += "Für die Auslegung immer das Anlaufmoment und das Beschleunigungsmoment (J·α) addieren — "
      + "das Haltemoment allein reicht nie.";
    return { out: s, hint: hint };
  },
  /* --- Batterielaufzeit --- */
  akku: function (v) {
    if (!isFinite(v.cap) || !isFinite(v.i)) return { out: "Kapazität (mAh) und mittleren Strom (mA) eintragen." };
    var h = v.cap / v.i;
    var nutz = isFinite(v.d) ? v.d / 100 : 0.8;
    var real = h * nutz;
    return {
      out: "theoretisch " + sig(h, 3) + " h  ·  realistisch " + sig(real, 3) + " h ("
        + sig(real / 24, 3) + " Tage)",
      hint: "Der Abschlag von " + Math.round((1 - nutz) * 100) + " % deckt Selbstentladung, Wandlerverluste, "
        + "Kälte und die Tatsache ab, dass eine Zelle unter Last nicht bis zur letzten Milliamperestunde nutzbar ist. "
        + "Bei Funkgeräten zählt der Mittelwert aus Schlafstrom und Sendespitzen, nicht der Spitzenwert."
    };
  },
  /* --- FPV: Schub-Gewicht-Verhaeltnis und Schwebegas --- */
  fpvschub: function (v) {
    var m = v.awg, f = v.f, n = isFinite(v.n) && v.n > 0 ? v.n : 4;
    if (!isFinite(m) || m <= 0 || !isFinite(f)) return { out: "Abfluggewicht und Standschub je Motor eintragen." };
    var total = f * n;
    var twr = total / m;
    var hoverThrust = m / n;
    /* Schub steigt naeherungsweise mit dem Quadrat der Drehzahl: der Knueppelweg
       liegt daher zwischen dem reinen Schubanteil und dessen Wurzel. */
    var lo = 100 / twr, hi = 100 * Math.sqrt(1 / twr);
    var lvl = twr < 2 ? "zu wenig — das Quad hängt am Gas und lässt sich kaum kontrollieren"
      : twr < 3 ? "reicht zum Schweben und für ruhige Kamerafahrten, nicht für Acro"
      : twr < 5 ? "solide für Cinematic und ruhiges Freestyle"
      : twr < 9 ? "klassischer 5-Zoll-Freestyle-Bereich"
      : "Rennklasse — bei so wenig Schwebegas wird die Gasauflösung am Knüppel grob";
    return {
      out: "Gesamtschub = " + sig(total, 4) + " g  ·  T/W = " + sig(twr, 3) + " : 1  ·  Schwebeschub je Motor = "
        + sig(hoverThrust, 3) + " g  ·  Schwebegas ≈ " + sig(lo, 2) + "–" + sig(hi, 2) + " %",
      hint: "Einordnung: " + lvl + ". Der Standschub aus der Herstellertabelle gilt am Boden mit frischem Akku und "
        + "ohne Fahrtwind — im Flug bleiben davon erfahrungsgemäß 10–20 % weniger. Die Spanne beim Schwebegas kommt "
        + "daher, dass der Schub etwa mit dem Quadrat der Drehzahl steigt: der reine Schubanteil ist die Untergrenze, "
        + "die Knüppelstellung liegt in der Praxis darüber."
    };
  },
  /* --- FPV: Flugzeit --- */
  fpvflug: function (v) {
    var cap = v.cap, s = v.s, m = v.awg, eff = v.eff, amp = v.i;
    var use = isFinite(v.use) ? v.use / 100 : 0.8;
    if (!isFinite(cap) || !isFinite(s) || cap <= 0 || s <= 0) return { out: "Kapazität (mAh) und Zellenzahl eintragen." };
    var wh = cap / 1000 * 3.7 * s;
    var out = "Energie = " + sig(wh, 3) + " Wh";
    var hint = "Gerechnet mit 3,7 V Nennspannung je Zelle. Nutzbar sind hier " + Math.round(use * 100) + " % — der Rest "
      + "ist Reserve, damit die Zellen nicht unter etwa 3,5 V unter Last einbrechen. ";
    if (!isFinite(amp) && isFinite(m) && isFinite(eff) && eff > 0) {
      var p = m / eff;
      amp = p / (3.7 * s);
      hint = "Schwebeleistung = " + sig(p, 3) + " W bei " + eff + " g/W, daraus " + sig(amp, 3) + " A mittlerer Strom. " + hint;
    }
    if (isFinite(amp) && amp > 0) {
      var t = 60 * (cap / 1000) * use / amp;
      out += "  ·  mittlerer Strom = " + sig(amp, 3) + " A  ·  Flugzeit ≈ " + sig(t, 3) + " min";
      hint += "Das ist eine Schweberechnung. Freestyle zieht das Zwei- bis Dreifache, ein Renn-Pack ist nach der Hälfte "
        + "der rechnerischen Zeit leer. Für die Flugreise zählt die Energie: " + sig(wh, 3) + " Wh je Pack.";
    } else {
      out += "  ·  für die Flugzeit zusätzlich Gewicht und Effizienz oder den mittleren Strom eintragen";
    }
    return { out: out, hint: hint };
  },
  /* --- FPV: Drehzahl und Blattspitzengeschwindigkeit --- */
  fpvprop: function (v) {
    var kv = v.kv, s = v.s, d = v.d, p = v.p;
    if (!isFinite(kv) || !isFinite(s) || !isFinite(d) || d <= 0) {
      return { out: "kV, Zellenzahl und Propellerdurchmesser (Zoll) eintragen." };
    }
    var uFull = 4.2 * s, uNom = 3.7 * s;
    var nIdle = kv * uFull;
    /* Unter Propellerlast bleiben je nach Blattzahl und Steigung rund 65–85 %
       der Leerlaufdrehzahl uebrig — deshalb hier bewusst eine Spanne. */
    var nLo = nIdle * 0.65, nHi = nIdle * 0.85;
    var vLo = Math.PI * (d * 0.0254) * nLo / 60, vHi = Math.PI * (d * 0.0254) * nHi / 60;
    var out = "Leerlauf (voller Akku) ≈ " + sig(nIdle, 5) + " min⁻¹  ·  unter Last ≈ " + sig(nLo, 4) + "–" + sig(nHi, 4)
      + " min⁻¹  ·  Blattspitze ≈ " + sig(vLo, 3) + "–" + sig(vHi, 3) + " m/s (bis Mach " + sig(vHi / 343, 2) + ")";
    var hint = "kV mal Akkuspannung ergibt die Leerlaufdrehzahl ohne Propeller. Unter Last bleiben davon je nach Blattzahl, "
      + "Steigung und Zuladung rund 65–85 % übrig — ein schwer belasteter Dreiblatt-Propeller liegt am unteren Ende, ein "
      + "leichter Zweiblatt-Propeller am oberen. Bei " + sig(uNom, 3) + " V Nennspannung wären es " + sig(kv * uNom, 5)
      + " min⁻¹ Leerlauf. Ab etwa Mach 0,6 (rund 200 m/s) fällt der Wirkungsgrad an der Blattspitze merklich ab und der "
      + "Propeller wird laut — das ist der Grund, warum große Propeller niedrige kV brauchen.";
    if (isFinite(p) && p > 0) {
      var vP = p * 0.0254 * nHi / 60;
      out += "  ·  Steigungsgeschwindigkeit ≈ bis " + sig(vP, 3) + " m/s (" + sig(vP * 3.6, 3) + " km/h)";
      hint += " Die Steigungsgeschwindigkeit ist eine theoretische Obergrenze ohne Schlupf; real erreicht ein Quad davon "
        + "etwa 60–70 %.";
    }
    return { out: out, hint: hint };
  },
  /* --- FPV: LiPo-Kennwerte --- */
  fpvlipo: function (v) {
    var s = v.s, cap = v.cap, c = v.c, u = v.u;
    if (!isFinite(s) || s <= 0) return { out: "Zellenzahl eintragen." };
    var out = "voll " + sig(4.2 * s, 3) + " V  ·  Lager " + sig(3.8 * s, 3) + " V  ·  nominal " + sig(3.7 * s, 3)
      + " V  ·  landen " + sig(3.5 * s, 3) + " V  ·  Untergrenze " + sig(3.3 * s, 3) + " V";
    var hint = "Die 3,5 V je Zelle sind der Wert unter Last im Flug — nach der Landung erholt sich die Zelle auf etwa "
      + "3,7 V. Wer regelmäßig unter 3,3 V in Ruhe geht, verliert spürbar Zyklen. ";
    if (isFinite(cap) && cap > 0) {
      out += "  ·  " + sig(cap / 1000 * 3.7 * s, 3) + " Wh";
      hint += "Ladestrom 1C = " + sig(cap / 1000, 3) + " A; mehr als 2C verkürzt die Lebensdauer spürbar. ";
      if (isFinite(c) && c > 0) {
        out += "  ·  Dauerstrom laut Aufdruck " + sig(c * cap / 1000, 4) + " A";
        hint += "Die C-Angabe auf dem Schrumpfschlauch ist unnormiert und praktisch nie gemessen — der Innenwiderstand "
          + "sagt deutlich mehr über den Pack aus. ";
      }
    }
    if (isFinite(u) && u > 0) {
      var per = u / s;
      var soc = Math.max(0, Math.min(100, (per - 3.5) / (4.2 - 3.5) * 100));
      out += "  ·  gemessen " + sig(per, 3) + " V/Zelle";
      hint += "Bei " + sig(per, 3) + " V je Zelle in Ruhe sind grob " + Math.round(soc) + " % der nutzbaren Ladung übrig. "
        + "Die Schätzung ist bewusst grob: die LiPo-Entladekurve ist in der Mitte sehr flach.";
    }
    return { out: out, hint: hint };
  },
  /* --- FPV: Link-Budget nach Friis --- */
  fpvfunk: function (v) {
    var pmw = v.p, sens = v.s, f = v.f;
    var gt = isFinite(v.gt) ? v.gt : 0, gr = isFinite(v.gr) ? v.gr : 0;
    var marg = isFinite(v.m) ? v.m : 10;
    if (!isFinite(pmw) || pmw <= 0 || !isFinite(sens) || !isFinite(f) || f <= 0) {
      return { out: "Sendeleistung, Empfängerempfindlichkeit und Frequenz eintragen." };
    }
    var pdbm = 10 * Math.log10(pmw);
    var budget = pdbm + gt + gr - sens - marg;
    var dkm = Math.pow(10, (budget - 32.45 - 20 * Math.log10(f)) / 20);
    return {
      out: "Sendeleistung = " + sig(pdbm, 3) + " dBm  ·  Streckenbudget = " + sig(budget, 4) + " dB  ·  Reichweite im "
        + "Freiraum ≈ " + (dkm < 1 ? sig(dkm * 1000, 3) + " m" : sig(dkm, 3) + " km"),
      hint: "Freiraumdämpfung nach Friis, mit " + marg + " dB Reserve. Das ist eine Obergrenze für ideale "
        + "Sichtverbindung — Vegetation, Gebäude, der eigene Körper vor der Antenne und Mehrwegeausbreitung kosten "
        + "schnell 10–20 dB, also einen Faktor 3 bis 10 in der Reichweite. Verdoppelte Sendeleistung bringt 3 dB und "
        + "damit rund 40 % mehr Reichweite; dieselben 3 dB gibt es über die Antenne geschenkt, ohne Strom und ohne Wärme."
    };
  },
  /* --- Einheiten-Vorsatz --- */
  vorsatz: function (v, el) {
    var val = num(($("[data-k='wert']", el) || {}).value);
    var from = num(($("[data-k='von']", el) || {}).value);
    var to = num(($("[data-k='nach']", el) || {}).value);
    if (!isFinite(val) || !isFinite(from) || !isFinite(to)) return { out: "Wert und beide Vorsätze wählen." };
    var res = val * from / to;
    return { out: sig(res, 6) + "  (Basiswert: " + (val * from).toExponential(4) + ")",
      hint: "Vorsätze sind reine Zehnerpotenzen. In Datenblättern ist µ oft als „u“ geschrieben, "
        + "weil das Zeichen im ASCII fehlt." };
  },

  /* ------------------------------------------------------------------
     MECHANIK
     ------------------------------------------------------------------ */

  /* --- Querschnittswerte und Biegebalken --------------------------------
     Flaechentraegheitsmoment I, Widerstandsmoment W, Biegespannung und
     Durchbiegung fuer die vier Lastfaelle, die im Alltag vorkommen. --- */
  balken: function (v, el) {
    var form = ($("[data-k='form']", el) || {}).value || "rechteck";
    var fall = ($("[data-k='fall']", el) || {}).value || "kragarm-f";
    var a = v.a, b = v.b, L = v.laenge, E = v.e, F = v.f;
    if (!isFinite(a)) return { out: "Abmessungen eintragen." };
    var A, I, W, Wt = NaN, hoch;
    if (form === "rechteck") {
      if (!isFinite(b)) return { out: "Breite und Höhe eintragen." };
      A = a * b; I = a * b * b * b / 12; W = a * b * b / 6; hoch = b;
    } else if (form === "rund") {
      A = Math.PI / 4 * a * a; I = Math.PI * Math.pow(a, 4) / 64; W = Math.PI * a * a * a / 32;
      Wt = 2 * W; hoch = a;
    } else if (form === "rohr") {
      if (!isFinite(b) || b >= a) return { out: "Innendurchmesser muss kleiner als der Außendurchmesser sein." };
      A = Math.PI / 4 * (a * a - b * b);
      I = Math.PI * (Math.pow(a, 4) - Math.pow(b, 4)) / 64;
      W = 2 * I / a; Wt = 2 * W; hoch = a;
    } else {                                   /* Quadratrohr: a aussen, b Wand */
      if (!isFinite(b) || 2 * b >= a) return { out: "Wandstärke muss kleiner als die halbe Kantenlänge sein." };
      var i2 = a - 2 * b;
      A = a * a - i2 * i2;
      I = (Math.pow(a, 4) - Math.pow(i2, 4)) / 12;
      W = 2 * I / a; hoch = a;
    }
    var geo = "A = " + sig(A, 4) + " mm²  ·  I = " + sig(I, 4) + " mm⁴  ·  W = " + sig(W, 4) + " mm³"
      + (isFinite(Wt) ? "  ·  W_t = " + sig(Wt, 4) + " mm³" : "");
    if (!isFinite(L) || !isFinite(F)) {
      return { out: geo, hint: "Länge, Last und E-Modul ergänzen, dann kommen Biegespannung und Durchbiegung dazu. "
        + "I und W gelten für Biegung um die Achse senkrecht zur Höhe " + sig(hoch, 3) + " mm." };
    }
    /* Momente und Durchbiegung je Lastfall; F in N, Streckenlast q in N/mm */
    var M, f, txt;
    if (fall === "kragarm-f")      { M = F * L;          f = F * L * L * L / (3 * E * I);        txt = "Kragarm, Einzellast am Ende"; }
    else if (fall === "kragarm-q") { M = F * L / 2;      f = F * L * L * L / (8 * E * I);        txt = "Kragarm, Streckenlast"; }
    else if (fall === "traeger-f") { M = F * L / 4;      f = F * L * L * L / (48 * E * I);       txt = "Träger auf zwei Stützen, Last in der Mitte"; }
    else                           { M = F * L / 8;      f = 5 * F * L * L * L / (384 * E * I);  txt = "Träger auf zwei Stützen, Streckenlast"; }
    /* Bei den Streckenlastfaellen ist F die Gesamtlast, nicht q — so ist es
       vergleichbar und der Nutzer muss nicht umrechnen. */
    var sigma = M / W;
    return {
      out: geo + "  ‖  M_max = " + sig(M / 1000, 4) + " Nm  ·  σ_b = " + sig(sigma, 3) + " N/mm²  ·  f = " + sig(f, 3) + " mm",
      hint: txt + ". Gesamtlast " + sig(F, 3) + " N über " + sig(L, 3) + " mm. Die Durchbiegung wächst mit der "
        + "dritten Potenz der Länge und sinkt linear mit I — doppelte Höhe eines Rechtecks bringt achtfache "
        + "Steifigkeit, doppelte Breite nur die doppelte. Für Stahl ist E = 210000 N/mm², für Aluminium 70000, "
        + "für PLA rund 3500. Zulässig ist σ_b höchstens Streckgrenze geteilt durch den Sicherheitsfaktor."
    };
  },

  /* --- Knicken nach Euler --- */
  knick: function (v, el) {
    var fall = ($("[data-k='fall']", el) || {}).value || "2";
    var beta = { "1": 2, "2": 1, "3": 0.699, "4": 0.5 }[fall];
    var E = v.e, I = v.i, L = v.laenge, A = v.a;
    if (!isFinite(E) || !isFinite(I) || !isFinite(L)) return { out: "E-Modul, Flächenträgheitsmoment und Länge eintragen." };
    var Lk = beta * L;
    var Fk = Math.PI * Math.PI * E * I / (Lk * Lk);
    var s = "L_k = " + sig(Lk, 4) + " mm  ·  F_krit = " + sig(Fk, 3) + " N  (" + sig(Fk / 1000, 3) + " kN)";
    var hint = "Eulerfall " + fall + ", Knicklängenbeiwert β = " + beta + ". ";
    if (isFinite(A) && A > 0) {
      var i = Math.sqrt(I / A);
      var lam = Lk / i;
      s += "  ·  λ = " + sig(lam, 3);
      hint += "Trägheitsradius i = " + sig(i, 3) + " mm, Schlankheitsgrad λ = " + sig(lam, 3) + ". "
        + "Die Eulerformel gilt nur im elastischen Bereich: für Baustahl S235 ab λ ≈ 104, für Aluminium ab "
        + "λ ≈ 60. Darunter versagt der Stab durch Fließen, nicht durch Knicken — dann mit Tetmajer oder "
        + "Omega-Verfahren rechnen. ";
    }
    hint += "Knicken kündigt sich nicht an, deshalb sind hier Sicherheitsfaktoren von 3 bis 5 üblich. "
      + "Doppelte Länge viertelt die Knicklast; eine Abstützung in der Mitte vervierfacht sie.";
    return { out: s, hint: hint };
  },

  /* --- Schraubenvorspannung und Anziehdrehmoment (VDI 2230, vereinfacht) --- */
  schraube: function (v, el) {
    var SZ = {
      M3:  { d2: 2.675,  d3: 2.387,  P: 0.5,  Dkm: 4.0 },
      M4:  { d2: 3.545,  d3: 3.141,  P: 0.7,  Dkm: 5.2 },
      M5:  { d2: 4.480,  d3: 4.019,  P: 0.8,  Dkm: 6.2 },
      M6:  { d2: 5.350,  d3: 4.773,  P: 1.0,  Dkm: 7.75 },
      M8:  { d2: 7.188,  d3: 6.466,  P: 1.25, Dkm: 10.3 },
      M10: { d2: 9.026,  d3: 8.160,  P: 1.5,  Dkm: 12.8 },
      M12: { d2: 10.863, d3: 9.853,  P: 1.75, Dkm: 15.05 },
      M14: { d2: 12.701, d3: 11.546, P: 2.0,  Dkm: 17.55 },
      M16: { d2: 14.701, d3: 13.546, P: 2.0,  Dkm: 20.0 },
      M20: { d2: 18.376, d3: 17.294, P: 2.5,  Dkm: 25.1 }
    };
    var RP = { "8.8": 640, "10.9": 940, "12.9": 1100, "70": 450, "A2-70": 450 };
    var g = ($("[data-k='groesse']", el) || {}).value || "M8";
    var fk = ($("[data-k='klasse']", el) || {}).value || "8.8";
    var s = SZ[g], rp = RP[fk];
    var mu = isFinite(v.mu) ? v.mu : 0.14;
    if (!s || !rp) return { out: "Größe und Festigkeitsklasse wählen." };
    if (mu <= 0 || mu > 0.5) return { out: "Reibungszahl zwischen 0,04 und 0,5 eintragen." };
    var A0 = Math.PI / 4 * s.d3 * s.d3;
    var t = 1.5 * (s.d2 / s.d3) * (s.P / (Math.PI * s.d2) + 1.155 * mu);
    var FM = 0.9 * rp * A0 / Math.sqrt(1 + 3 * t * t);
    var MA = FM * (0.16 * s.P + 0.58 * s.d2 * mu + s.Dkm / 2 * mu) / 1000;
    return {
      out: "M_A = " + sig(MA, 3) + " Nm  ·  Vorspannkraft F_M ≈ " + sig(FM / 1000, 3) + " kN",
      hint: g + " " + fk + " bei Reibungszahl µ = " + sig(mu, 2) + ", 90 % Ausnutzung der Streckgrenze "
        + "(R_p0,2 = " + rp + " N/mm²), Regelgewinde, Sechskantkopf auf Stahl. Die Reibung entscheidet fast "
        + "alles: µ = 0,10 (geölt) bringt bei gleichem Moment rund ein Viertel mehr Vorspannkraft, µ = 0,20 "
        + "(trocken, rau) ein Viertel weniger. Nur etwa 10 % des Moments landen als Vorspannung im Bolzen, "
        + "der Rest ist Reibung unter Kopf und im Gewinde. Für sicherheitsrelevante Verbindungen gilt die "
        + "Herstellerangabe oder die vollständige Rechnung nach VDI 2230, nicht dieser Überschlag."
    };
  },

  /* --- ISO-286-Passung, Einheitsbohrung --- */
  passung: function (v, el) {
    /* Nennmassbereiche in mm (Obergrenzen), fein genug fuer r und s */
    var R = [3, 6, 10, 18, 30, 50, 65, 80, 100, 120];
    var IT = {
      5:  [4, 5, 6, 8, 9, 11, 13, 13, 15, 15],
      6:  [6, 8, 9, 11, 13, 16, 19, 19, 22, 22],
      7:  [10, 12, 15, 18, 21, 25, 30, 30, 35, 35],
      8:  [14, 18, 22, 27, 33, 39, 46, 46, 54, 54],
      9:  [25, 30, 36, 43, 52, 62, 74, 74, 87, 87],
      10: [40, 48, 58, 70, 84, 100, 120, 120, 140, 140],
      11: [60, 75, 90, 110, 130, 160, 190, 190, 220, 220]
    };
    /* Grundabmasse Welle: a..h oberes Abmass es, j..z unteres Abmass ei */
    var DEV = {
      e: [-14, -20, -25, -32, -40, -50, -60, -60, -72, -72],
      f: [-6, -10, -13, -16, -20, -25, -30, -30, -36, -36],
      g: [-2, -4, -5, -6, -7, -9, -10, -10, -12, -12],
      h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      k: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3],
      m: [2, 4, 6, 7, 8, 9, 11, 11, 13, 13],
      n: [4, 8, 10, 12, 15, 17, 20, 20, 23, 23],
      p: [6, 12, 15, 18, 22, 26, 32, 32, 37, 37],
      r: [10, 15, 19, 23, 28, 34, 41, 43, 51, 54],
      s: [14, 19, 23, 28, 35, 43, 53, 59, 71, 79]
    };
    var d = v.d;
    var bohr = ($("[data-k='bohrung']", el) || {}).value || "H7";
    var well = ($("[data-k='welle']", el) || {}).value || "g6";
    if (!isFinite(d) || d <= 0) return { out: "Nennmaß in mm eintragen." };
    if (d > 120) return { out: "Diese Tabelle deckt Nennmaße bis 120 mm ab — darüber ins Normblatt ISO 286-2 schauen." };
    var idx = 0;
    while (idx < R.length - 1 && d > R[idx]) idx++;
    var itB = parseInt(bohr.slice(1), 10), itW = parseInt(well.slice(1), 10);
    var letter = well[0];
    if (!IT[itB] || !IT[itW] || !DEV[letter]) return { out: "Diese Paarung ist in der Tabelle nicht hinterlegt." };
    var TB = IT[itB][idx], TW = IT[itW][idx];
    var EI = 0, ES = TB;                                        /* Einheitsbohrung H */
    var es, ei;
    if ("abcdefgh".indexOf(letter) >= 0) { es = DEV[letter][idx]; ei = es - TW; }
    else { ei = DEV[letter][idx]; es = ei + TW; }
    var sMax = ES - ei, sMin = EI - es;                          /* µm; negativ = Übermaß */
    var art = sMin >= 0 ? "Spielpassung" : (sMax <= 0 ? "Übermaßpassung" : "Übergangspassung");
    var fmt = function (x) { return (x > 0 ? "+" : "") + x + " µm"; };
    return {
      out: "Bohrung " + bohr + ": " + sig(d, 6) + " " + fmt(EI) + " / " + fmt(ES)
        + "  ·  Welle " + well + ": " + sig(d, 6) + " " + fmt(ei) + " / " + fmt(es)
        + "  ‖  " + art + ": " + (sMin >= 0 ? "Spiel " + sMin + " … " + sMax + " µm"
          : (sMax <= 0 ? "Übermaß " + (-sMax) + " … " + (-sMin) + " µm"
            : "von " + (-sMin) + " µm Übermaß bis " + sMax + " µm Spiel")),
      hint: "Einheitsbohrung — die Bohrung bleibt H, die Passung wird über die Welle eingestellt; so bleibt "
        + "der Reibahlen- und Lehrensatz klein. Toleranzfeld der Bohrung " + TB + " µm, der Welle " + TW + " µm. "
        + "Merkhilfe: H7/g6 gleitet, H7/h6 schiebt sich stramm zusammen, H7/k6 sitzt fest und lässt sich noch "
        + "auspressen, H7/p6 und H7/s6 sind Presssitze und brauchen Kraft oder Temperaturunterschied. "
        + "Wälzlager sind die Ausnahme: dort gibt der Lagerhersteller Welle und Gehäuse direkt vor."
    };
  },

  /* --- Waelzlager: nominelle Lebensdauer L10 --- */
  lager: function (v, el) {
    var typ = ($("[data-k='typ']", el) || {}).value || "kugel";
    var p = typ === "rolle" ? 10 / 3 : 3;
    var C = v.c, P = v.p, n = v.n;
    if (!isFinite(C) || !isFinite(P) || P <= 0) return { out: "Tragzahl C und Belastung P eintragen." };
    var L10 = Math.pow(C / P, p);                                 /* in 10^6 Umdrehungen */
    var s = "L₁₀ = " + sig(L10, 3) + " · 10⁶ Umdrehungen";
    var hint = "Exponent p = " + (typ === "rolle" ? "10/3 (Rollenlager)" : "3 (Kugellager)") + ". "
      + "L₁₀ heißt: 90 % der Lager erreichen diese Laufleistung, 10 % fallen vorher aus. ";
    if (isFinite(n) && n > 0) {
      var h = L10 * 1e6 / (60 * n);
      s += "  ·  L₁₀h = " + sig(h, 3) + " h  (" + sig(h / 24, 3) + " Tage Dauerlauf)";
      hint += "Bei " + sig(n, 4) + " min⁻¹ sind das " + sig(h, 3) + " Betriebsstunden. Richtwerte: "
        + "Haushaltsgeräte 1000–2000 h, Elektrowerkzeuge 500–1000 h, Werkzeugmaschinen 20000 h, "
        + "Getriebe im Dauerbetrieb 30000 h und mehr. ";
    }
    hint += "C ist die dynamische Tragzahl aus dem Katalog, P die äquivalente Belastung aus Radial- und "
      + "Axialanteil (P = X·F_r + Y·F_a). Verdoppelte Last bedeutet beim Kugellager ein Achtel der Lebensdauer. "
      + "Schmierung, Verschmutzung und Fluchtungsfehler ändern das Ergebnis in der Praxis stärker als die Rechnung.";
    return { out: s, hint: hint };
  },

  /* --- Waermedehnung und Zwangsspannung --- */
  dehnung: function (v, el) {
    var MAT = {
      stahl: ["Baustahl", 12, 210000], edelstahl: ["Edelstahl A2/A4", 16, 200000],
      guss: ["Grauguss", 10, 110000], alu: ["Aluminium", 23, 70000],
      messing: ["Messing", 19, 100000], kupfer: ["Kupfer", 17, 120000],
      titan: ["Titan", 8.6, 110000], invar: ["Invar", 1.2, 145000],
      glas: ["Borosilikatglas", 3.3, 64000], beton: ["Beton", 12, 30000],
      pla: ["PLA", 68, 3500], petg: ["PETG", 60, 2100], abs: ["ABS/ASA", 90, 2200],
      nylon: ["Nylon (PA)", 90, 2000], pc: ["Polycarbonat", 65, 2300]
    };
    var k = ($("[data-k='mat']", el) || {}).value || "stahl";
    var m = MAT[k];
    var L = v.laenge, dT = v.dt;
    if (!m) return { out: "Werkstoff wählen." };
    if (!isFinite(L) || !isFinite(dT)) return { out: "Länge und Temperaturänderung eintragen." };
    var dL = m[1] * 1e-6 * L * dT;
    var sp = m[2] * m[1] * 1e-6 * dT;
    return {
      out: "ΔL = " + sig(dL, 3) + " mm  ·  α = " + m[1] + " · 10⁻⁶/K  ·  bei voller Behinderung σ = " + sig(Math.abs(sp), 3) + " N/mm²",
      hint: m[0] + ", " + sig(L, 4) + " mm bei " + sig(dT, 3) + " K Temperaturänderung. Die Zwangsspannung "
        + "hängt nicht von der Länge ab, nur von α, E und ΔT — ein eingespannter Stahlträger baut schon bei "
        + "40 K rund 100 N/mm² auf, mehr als ein Drittel der Streckgrenze von S235. Deshalb Loslager, "
        + "Langlöcher und Dehnfugen. Bei Materialpaarungen zählt die Differenz der Ausdehnungskoeffizienten: "
        + "Aluminium auf Stahl macht 11 · 10⁻⁶/K aus, ein gedrucktes Teil auf Aluminium das Vierfache davon."
    };
  },

  /* --- Zerspanung: Schnittgeschwindigkeit, Drehzahl, Vorschub --- */
  zerspanung: function (v) {
    var vc = v.vc, d = v.d, z = v.z, fz = v.fz, ap = v.ap, ae = v.ae;
    if (!isFinite(vc) || !isFinite(d) || d <= 0) return { out: "Schnittgeschwindigkeit und Werkzeugdurchmesser eintragen." };
    var n = vc * 1000 / (Math.PI * d);
    var s = "n = " + sig(n, 4) + " min⁻¹";
    var hint = "v_c = π · d · n / 1000. Richtwerte für HSS: Baustahl 25–35, Aluminium 60–120, Messing 60–90, "
      + "Kunststoff 100–200 m/min. Für Hartmetall etwa das Drei- bis Fünffache, beschichtet noch mehr. ";
    if (isFinite(z) && isFinite(fz) && z > 0) {
      var vf = n * z * fz;
      s += "  ·  v_f = " + sig(vf, 4) + " mm/min";
      hint += "Vorschub v_f = n · z · f_z, hier " + z + " Schneiden mit " + sig(fz, 3) + " mm Zahnvorschub. ";
      if (isFinite(ap) && isFinite(ae)) {
        var Q = ap * ae * vf / 1000;
        s += "  ·  Q = " + sig(Q, 3) + " cm³/min";
        hint += "Zeitspanvolumen Q = a_p · a_e · v_f, ein guter Vergleichswert für die Belastung von Spindel "
          + "und Maschine. ";
      }
    }
    hint += "Zu kleiner Zahnvorschub ist gefährlicher als zu großer: die Schneide reibt statt zu schneiden, "
      + "wird heiß und stumpf. Beim Bohren gilt f in mm/Umdrehung statt pro Zahn.";
    return { out: s, hint: hint };
  }
};

$$("[data-calc]").forEach(function (el) {
  var name = el.dataset.calc;
  var fn = CALC[name];
  if (!fn) return;
  var fields = $$("[data-k]", el);
  var out = $("[data-out]", el);
  var hint = $("[data-hint]", el);
  function run() {
    var v = {};
    fields.forEach(function (f) {
      var raw = f.value;
      if (f.tagName === "SELECT" && isNaN(num(raw))) { v[f.dataset.k] = raw; return; }
      v[f.dataset.k] = raw === "" ? NaN : num(raw);
    });
    var r = fn(v, el) || {};
    if (out) out.textContent = r.out || "";
    if (hint) { hint.textContent = r.hint || ""; hint.hidden = !r.hint; }
  }
  fields.forEach(function (f) {
    f.addEventListener("input", run);
    f.addEventListener("change", run);
  });
  run();
});

/* ==========================================================================
   5 · REGELKREIS-SPIELWIESE
   Diskrete Simulation eines PID-Reglers an einer PT2-Strecke mit Totzeit.
   Zeigt, was die drei Anteile tatsaechlich tun — mehr als jede Formel.
   ========================================================================== */
(function () {
  var box = $("[data-sim='pid']");
  if (!box) return;
  var svg = $("svg", box);
  var line = $(".pl-y", box);
  var lineU = $(".pl-u", box);
  var read = $("[data-sim-out]", box);
  if (!svg || !line) return;

  var W = 620, H = 240, PADL = 40, PADR = 12, PADT = 12, PADB = 26;

  function simulate(kp, tn, tv, T1, Tt) {
    var dt = 0.02, N = 1200;           /* 24 s */
    var y = 0, y1 = 0, ei = 0, ep = 0;
    var buf = [], bi = 0, delay = Math.max(0, Math.round(Tt / dt));
    for (var i = 0; i < delay; i++) buf.push(0);
    var ys = [], us = [];
    for (var k = 0; k < N; k++) {
      var w = k * dt < 1 ? 0 : 1;               /* Sollwertsprung bei t = 1 s */
      var e = w - y;
      ei += e * dt;
      var ud = tv * (e - ep) / dt;
      ep = e;
      var u = kp * (e + (tn > 0 ? ei / tn : 0) + ud);
      if (u > 3) { u = 3; ei -= e * dt; }        /* Stellgroessenbegrenzung + Anti-Windup */
      if (u < -3) { u = -3; ei -= e * dt; }
      var ud2 = delay ? buf[bi] : u;
      if (delay) { buf[bi] = u; bi = (bi + 1) % delay; }
      /* PT2 als zwei hintereinandergeschaltete PT1 */
      y1 += dt / T1 * (ud2 - y1);
      y += dt / T1 * (y1 - y);
      ys.push(y); us.push(u);
    }
    return { y: ys, u: us, dt: dt };
  }

  function path(vals, dt, ymin, ymax) {
    var n = vals.length;
    var sx = (W - PADL - PADR) / (n * dt);
    var sy = (H - PADT - PADB) / (ymax - ymin);
    var d = "";
    for (var i = 0; i < n; i += 2) {
      var x = PADL + i * dt * sx;
      var yy = H - PADB - (vals[i] - ymin) * sy;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + yy.toFixed(1);
    }
    return d;
  }

  function update() {
    var kp = num($("[data-p='kp']", box).value);
    var tn = num($("[data-p='tn']", box).value);
    var tv = num($("[data-p='tv']", box).value);
    var T1 = num($("[data-p='t1']", box).value);
    var Tt = num($("[data-p='tt']", box).value);
    $$("[data-p]", box).forEach(function (s) {
      var lab = $("[data-pv='" + s.dataset.p + "']", box);
      if (lab) lab.textContent = s.value;
    });
    var r = simulate(kp, tn, tv, T1, Tt);
    line.setAttribute("d", path(r.y, r.dt, -0.3, 2.0));
    if (lineU) lineU.setAttribute("d", path(r.u, r.dt, -0.3, 2.0));
    /* Kennwerte: Ueberschwingen und Ausregelzeit (2-%-Band) */
    var max = Math.max.apply(null, r.y);
    var settle = null;
    for (var i = r.y.length - 1; i >= 0; i--) {
      if (Math.abs(r.y[i] - 1) > 0.02) { settle = (i + 1) * r.dt - 1; break; }
    }
    if (read) {
      read.textContent = "Überschwingen " + Math.max(0, Math.round((max - 1) * 100)) + " %  ·  "
        + "Ausregelzeit (2 %) " + (settle === null ? "sofort" : settle > 22 ? "> 22 s" : settle.toFixed(1) + " s")
        + "  ·  bleibende Regelabweichung " + (r.y[r.y.length - 1] - 1).toFixed(3);
    }
  }
  $$("[data-p]", box).forEach(function (s) { s.addEventListener("input", update); });
  $$("[data-preset]", box).forEach(function (b) {
    b.addEventListener("click", function () {
      var p = b.dataset.preset.split(",");
      ["kp", "tn", "tv"].forEach(function (k, i) { $("[data-p='" + k + "']", box).value = p[i]; });
      $$("[data-preset]", box).forEach(function (o) { o.classList.toggle("active", o === b); });
      update();
    });
  });
  update();
})();
})();
