/* ============================================================================
   Überschriften-Anker der Modulabschnitte, vergeben beim Build.
   Jede h2–h4 im Abschnitt bekommt die ID <abschnitt>--<slug>. Damit kennt
   Pagefind die Fundstellen und die Volltextsuche springt direkt an die
   richtige Überschrift statt an den Anfang des Moduls.
   slug() muss mit dem Abschnitts-Router in src/pages/[slug].astro
   übereinstimmen, sonst laufen Build-IDs und Browser-IDs auseinander.
   ========================================================================== */
export const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", shy: "­" };
const decode = (s) =>
  s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (m, dec, hex, name) =>
    dec ? String.fromCodePoint(+dec) : hex ? String.fromCodePoint(parseInt(hex, 16)) : NAMED[name.toLowerCase()] ?? m,
  );

/* Überschriften ohne eigene ID bekommen <sec>--<slug> (Text wie textContent:
   Tags raus, Entities aufgelöst). Doppelte Slugs werden durchnummeriert. */
export function anchorHeadings(html, sec) {
  const used = new Set();
  let n = 0;
  return html.replace(/<h([2-4])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi, (tag, lv, attrs, inner) => {
    const i = n++;
    if (/\sid\s*=/i.test(attrs)) return tag;
    const base = `${sec}--${slug(decode(inner.replace(/<[^>]*>/g, ""))) || "h" + i}`;
    let id = base;
    for (let k = 2; used.has(id); k++) id = `${base}-${k}`;
    used.add(id);
    return `<h${lv} id="${id}"${attrs}>${inner}</h${lv}>`;
  });
}
