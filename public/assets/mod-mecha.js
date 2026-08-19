/* ============================================================================
   MECHATRONIK-HUB · gemeinsames Modul-Skript
   Alle elf Module des Hubs laden diese Datei. Jeder Baustein prueft zuerst,
   ob seine Elemente auf der Seite ueberhaupt vorkommen — was fehlt, kostet
   nichts. Inhalte stehen im HTML (Pagefind-Volltext, Betrieb ohne JS);
   hier liegt nur Verhalten: Falten, Filtern, Sortieren, Rechnen, Simulieren.
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
