/* Modul-Skript (nativ) — Funktions-JS aus dremel-8250-cheatsheet.html; Tab-/View-Code entfaellt. */
// ---- Bit-Daten ----
// col = Swatch-Farbe (Erkennungsfarbe), form = Bauform, merk = Erkennungsmerkmale
const bits=[
{name:"EZ Lock Trennscheibe Metall (EZ456/EZ546)",nr:"EZ456",cat:"cut",catL:"Trennen",for:"Stahl, Edelstahl",rpm:"25–30k",rc:"s-high",
 col:"#7a7a7a",form:"Dünne flache Scheibe, ⌀ ca. 38 mm",
 merk:["Graue, glasfaserverstärkte Scheibe, sehr dünn (~1 mm).","EZ-Lock-Nabe in der Mitte (gelb/schwarz), kein Schraubmandrell nötig.","Dunkler als die Kunststoff-Variante, oft mit Aufdruck „metal“."]},
{name:"EZ Lock Trennscheibe Kunststoff (EZ476)",nr:"EZ476",cat:"cut",catL:"Trennen",for:"Kunststoff, Acryl",rpm:"10–15k",rc:"s-mid",
 col:"#c9b27a",form:"Dünne flache Scheibe, ⌀ ca. 38 mm",
 merk:["Hellere, sandfarben/braune Scheibe.","Speziell für Kunststoff, schmilzt weniger als Metallscheibe.","EZ-Lock-Nabe mittig."]},
{name:"Trennscheibe verstärkt (426)",nr:"426",cat:"cut",catL:"Trennen",for:"Metall allg.",rpm:"25–30k",rc:"s-high",
 col:"#5a5a5a",form:"Flache Scheibe mit Loch, ⌀ 32 mm",
 merk:["Dunkelgrau mit eingelegtem Glasfasergewebe (sichtbares Netzmuster).","Klassische Variante mit Schraubmandrell (402), kein EZ-Lock.","Verschleißt, wird mit Gebrauch kleiner."]},
{name:"Diamant-Trennscheibe (EZ545)",nr:"EZ545",cat:"cut",catL:"Trennen",for:"Fliese, Keramik, Stein",rpm:"22–28k",rc:"s-high",
 col:"#b0b0b0",form:"Massive Stahlscheibe mit Diamantrand",
 merk:["Durchgehende Metallscheibe, keine Glasfaser.","Rand mit körniger Diamantbeschichtung statt Zähnen.","Nutzt sich kaum ab, deutlich teurer."]},
{name:"Glasfaser-Trennscheibe (EZ409)",nr:"EZ409",cat:"cut",catL:"Trennen",for:"Metall, dünn",rpm:"25–30k",rc:"s-high",
 col:"#8a8a8a",form:"Sehr dünne Scheibe (~0,5 mm), ⌀ 38 mm",
 merk:["Extra dünn für feine, schmale Schnitte.","Grau, flexibel, leicht durchscheinend am Rand.","EZ-Lock-Nabe."]},
{name:"Holz-Fräsmesser (EZ544)",nr:"EZ544",cat:"cut",catL:"Trennen",for:"Holz, Sperrholz",rpm:"25–30k",rc:"s-high",
 col:"#c98a3a",form:"Scheibe mit groben Hartmetallzähnen",
 merk:["Wenige große, sichtbare Sägezähne am Rand (wie Mini-Kreissägeblatt).","Kupfer/goldfarben beschichtet.","EZ-Lock, nur für Holz, nicht Metall."]},
{name:"Schleifstein Korund kegelig (8193)",nr:"8193",cat:"grind",catL:"Schleifen",for:"Stahl, Werkzeug",rpm:"20–30k",rc:"s-high",
 col:"#c97a8a",form:"Kegel-/Tonnenform auf Schaft",
 merk:["Rosa/braun-rosa Stein (Aluminiumoxid).","Fest mit dem Schaft verbunden, kein Mandrell.","Vor Erstgebrauch abrichten für runden Lauf."]},
{name:"Schleifstein Korund Zylinder (932)",nr:"932",cat:"grind",catL:"Schleifen",for:"Stahl, Eisen",rpm:"20–30k",rc:"s-high",
 col:"#c97a8a",form:"Zylinder auf Schaft, ⌀ ca. 9,5 mm",
 merk:["Gleicher rosa Korund wie 8193, aber gerade Walzenform.","Für flächiges Schleifen und Entgraten von Stahl.","Nicht für Glas/Stein geeignet."]},
{name:"Siliziumkarbid-Stein (84922)",nr:"84922",cat:"grind",catL:"Schleifen",for:"Glas, Stein, Keramik, NE-Metall",rpm:"15–25k",rc:"s-mid",
 col:"#3a4a55",form:"Kegel/Zylinder auf Schaft",
 merk:["Dunkelgrau bis grünlich-schwarz (deutlich dunkler als Korund).","Für harte/spröde Stoffe und Buntmetall.","Verwechslungsgefahr mit Korund: Farbe ist das Unterscheidungsmerkmal."]},
{name:"Diamant-Schleifbit (7103/7134)",nr:"7134",cat:"grind",catL:"Schleifen",for:"Glas, Keramik, Hartmetall",rpm:"15–25k",rc:"s-mid",
 col:"#9a9a9a",form:"Kleiner Stahlkopf, diamantbeschichtet",
 merk:["Metallischer Kopf mit feiner, körniger Oberfläche (kein Stein).","Verschiedene Formen: Kugel, Spitz, Walze.","Mit Wasser kühlen, sonst stumpft die Beschichtung ab."]},
{name:"HSS-Fräser Kugel/Zylinder (191/115)",nr:"115",cat:"carve",catL:"Fräsen",for:"Holz, Weichmetall, Kunststoff",rpm:"15–25k",rc:"s-mid",
 col:"#d4d4d4",form:"Stahlkopf mit geschnittenen Schneiden",
 merk:["Silbrig blank, scharfe spiralige/gerade Schneiden (wie Mini-Bohrer).","HSS = High Speed Steel, für weichere Stoffe.","Rattert es → zu langsam, höher drehen."]},
{name:"Hartmetall-Fräser (9901/9903)",nr:"9901",cat:"carve",catL:"Fräsen",for:"Stahl, Hartholz, GFK, Fliese",rpm:"25–30k",rc:"s-high",
 col:"#4a4a4a",form:"Stahlkopf mit feinen Kreuzschneiden",
 merk:["Dunkler/gräulicher als HSS, sehr feine kreuzgehauene Zähne.","Tungsten-Carbid, standfest bei harten Materialien.","Teurer, aber für Stahl die richtige Wahl."]},
{name:"Strukturierter Hartmetall-Schnitzer (9931)",nr:"9931",cat:"carve",catL:"Fräsen",for:"Holz schnell abtragen",rpm:"20–30k",rc:"s-high",
 col:"#5a5040",form:"Dicker Kopf mit grober Zahnung",
 merk:["Grobe, weit stehende Hartmetallzähne (fast wie Raspel).","Trägt Holz sehr schnell ab, grobes Schruppen.","Nicht für Feinarbeit."]},
{name:"Gravierspitze Diamant",nr:"7103",cat:"carve",catL:"Gravieren",for:"Glas, Metall, Stein",rpm:"10–20k",rc:"s-mid",
 col:"#9a9a9a",form:"Feine Nadel-/Kegelspitze",
 merk:["Sehr kleine, spitze diamantbeschichtete Spitze.","Für Linien und Schrift, leichte Hand.","Mehrere flache Durchgänge statt einem tiefen."]},
{name:"Schleiftrommel + Band (407/408)",nr:"407",cat:"sand",catL:"Schmirgeln",for:"Holz, Kunststoff, Metall",rpm:"20–30k",rc:"s-high",
 col:"#9a6a4a",form:"Gummizylinder mit aufgezogenem Band",
 merk:["Schwarzer Gummi-Mandrell, darüber sandpapiernes Schleifband.","Band ist wechselbar (408 = Bänder, 407 = Mandrell).","Verschiedene Körnungen erhältlich."]},
{name:"Schleifscheibe Klett (EZ411)",nr:"EZ411",cat:"sand",catL:"Schmirgeln",for:"Holz, Lack, Spachtel",rpm:"20–30k",rc:"s-high",
 col:"#c0392b",form:"Runde Klett-Schleifscheibe",
 merk:["Kleine runde Scheibe, per Klett auf Halteteller.","Für flächiges Schleifen, schneller Körnungswechsel.","EZ-Lock-Aufnahme."]},
{name:"Schleifband fein Kunststoff",nr:"432",cat:"sand",catL:"Schmirgeln",for:"Kunststoff, Acryl",rpm:"10–15k",rc:"s-mid",
 col:"#d8c89a",form:"Feines Schleifband auf Trommel",
 merk:["Feine Körnung (oft 120er), helle Farbe.","Niedrige Drehzahl, sonst schmilzt Kunststoff.","Auf 407er Trommel aufziehen."]},
{name:"Filzscheibe/-spitze (414/422)",nr:"414",cat:"pol",catL:"Polieren",for:"Metall, Kunststoff (m. Paste)",rpm:"10–15k",rc:"s-mid",
 col:"#e8e2d0",form:"Weiße Filzscheibe oder -spitze",
 merk:["Cremeweißer, fester Filz.","Immer mit Polierpaste verwenden, nie trocken.","Scheibe (414) für Flächen, Spitze (422) für Vertiefungen."]},
{name:"Polierscheibe Stoff (429)",nr:"429",cat:"pol",catL:"Polieren",for:"Metall, Schmuck",rpm:"10–15k",rc:"s-mid",
 col:"#f0ead8",form:"Weiche Stoffscheibe (Lamellen)",
 merk:["Mehrlagige weiche Baumwollscheibe, ausgefranst.","Für Hochglanz mit Polierpaste.","Weicher als Filz, für Endpolitur."]},
{name:"Drahtbürste Stahl (442/428)",nr:"428",cat:"clean",catL:"Bürsten",for:"Rost, Metall reinigen",rpm:"max 15k",rc:"s-low",
 col:"#8a8a8a",form:"Bürstenkopf mit Stahldrähten",
 merk:["Silbrige steife Stahlborsten, radial oder topfförmig.","Max. 15k, sonst lösen sich Drähte → Verletzungsgefahr.","Hinterlässt feine Kratzer auf Weichmetall."]},
{name:"Messingbürste (535/536)",nr:"535",cat:"clean",catL:"Bürsten",for:"Weichmetall, kein Kratzer",rpm:"max 15k",rc:"s-low",
 col:"#b8893a",form:"Bürstenkopf mit Messingdrähten",
 merk:["Goldgelbe, weichere Borsten als Stahl.","Kratzt Weichmetall (Messing, Alu) nicht.","Ebenfalls max. 15k."]},
{name:"Nylonbürste / Abrasiv (403/536)",nr:"403",cat:"clean",catL:"Bürsten",for:"Holz, Kunststoff reinigen",rpm:"max 15k",rc:"s-low",
 col:"#e0c040",form:"Bürstenkopf mit Kunststoffborsten",
 merk:["Gelbe/weiße flexible Nylonborsten, teils mit Schleifkorn.","Schonend, für Holzstruktur und empfindliche Oberflächen.","Keine Drahtgefahr, trotzdem niedrig drehen."]},
{name:"Bohrer HSS klein (1,0–3,2 mm)",nr:"628",cat:"drill",catL:"Bohren",for:"Holz, Kunststoff, Weichmetall",rpm:"25–30k",rc:"s-high",
 col:"#d4d4d4",form:"Spiralbohrer, Schaft 3,2 mm",
 merk:["Klassischer silberner Spiralbohrer, oft im Set gestaffelt.","Hohe Drehzahl, geringer Vorschub.","Kleine ⌀ brechen leicht bei Verkanten."]},
{name:"PCB-Bohrer Hartmetall",nr:"–",cat:"drill",catL:"Bohren",for:"Platine FR4",rpm:"20–28k",rc:"s-high",
 col:"#3a3a3a",form:"Sehr feiner Vollhartmetall-Bohrer",
 merk:["Dünner, dunkelgrauer Bohrer (0,6–1,2 mm), oft dicker Schaft.","Sehr spröde, bricht bei seitlichem Druck sofort.","Glasfaser stumpft schnell ab, mehrere bereithalten."]},
];

// render bits table (mit aufklappbaren Detailzeilen)
const body=document.getElementById('bits-body');
let openBit=null;
function detailRow(b){
return `<tr class="dr"><td colspan="5">
<div class="block"><div class="blk-title">Aussehen / Form</div><div class="blk-body"><span class="swatch" style="background:${b.col}"></span>${b.form}</div></div>
<div class="block"><div class="blk-title">Erkennungsmerkmale</div><div class="blk-body">${b.merk.map(m=>'• '+m).join('<br>')}</div></div>
</td></tr>`;
}
function renderBits(list){
body.innerHTML=list.map(b=>{
const isOpen=openBit===b.name;
let row=`<tr class="clk${isOpen?' open':''}" data-cat="${b.cat}" data-name="${b.name.replace(/"/g,'&quot;')}">
<td><span class="exp">▶</span>${b.name}</td><td>${b.nr}</td>
<td><span class="b b-${b.cat}">${b.catL}</span></td>
<td>${b.for}</td>
<td><span class="sp ${b.rc}">${b.rpm}</span></td></tr>`;
if(isOpen)row+=detailRow(b);
return row;
}).join('');
body.querySelectorAll('tr.clk').forEach(tr=>{
tr.addEventListener('click',()=>{
const n=tr.dataset.name.replace(/&quot;/g,'"');
openBit=openBit===n?null:n;
applyBits();
});
});
}
renderBits(bits);

// filter + search
let curF='all';
function applyBits(){
const q=document.getElementById('search-bits').value.toLowerCase();
renderBits(bits.filter(b=>{
const okF=curF==='all'||b.cat===curF;
const okQ=!q||(b.name+b.nr+b.for+b.catL).toLowerCase().includes(q);
return okF&&okQ;
}));
}
document.getElementById('search-bits').addEventListener('input',applyBits);
document.querySelectorAll('#filt-bits button').forEach(btn=>{
btn.addEventListener('click',()=>{
document.querySelectorAll('#filt-bits button').forEach(x=>x.classList.remove('active'));
btn.classList.add('active');curF=btn.dataset.f;applyBits();
});
});

// ---- generic table sort ----
function makeSortable(tableId){
const t=document.getElementById(tableId);
t.querySelectorAll('th').forEach((th,i)=>{
let dir=1;
th.addEventListener('click',()=>{
const tb=t.querySelector('tbody');
const rows=[...tb.querySelectorAll('tr')];
rows.sort((a,b)=>{
let av,bv;
const ca=a.children[i],cb=b.children[i];
const da=ca.querySelector('[data-v]'),db=cb.querySelector('[data-v]');
if(da||cb.querySelector('[data-v]')){
av=parseFloat((da||ca).dataset.v||ca.textContent)||0;
bv=parseFloat((db||cb).dataset.v||cb.textContent)||0;
return (av-bv)*dir;
}
av=ca.textContent.trim().toLowerCase();bv=cb.textContent.trim().toLowerCase();
return av<bv?-1*dir:av>bv?1*dir:0;
});
dir*=-1;
t.querySelectorAll('th .ar').forEach(a=>a.textContent='');
const ar=th.querySelector('.ar');if(ar)ar.textContent=dir>0?'▾':'▴';
rows.forEach(r=>tb.appendChild(r));
});
});
}
makeSortable('t-mat');
// Bits-Tabelle: Header nicht klickbar (Detailzeilen-Logik), Cursor zuruecksetzen
document.querySelectorAll('#t-bits th').forEach(th=>{th.style.cursor='default';});



document.getElementById('legend').textContent='Dremel 8250 · Drehzahlbereich 5.000–30.000 RPM · Spannzangen 0,8–3,2 mm · Angaben sind Richtwerte, immer am Reststück testen.';
