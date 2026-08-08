/* ============================================================================
   LÖTEN · Modul-Skript (nativ)
   Sortierbare Tabellen, Bauteil-Filter und Faltabschnitte — aus der
   Legacy-Seite uebernommen. Tab-System und App-Shell liefert das Layout.
   ========================================================================== */
/* ---------- TEMPERATUR-TABELLE ---------- */
const TEMP=[
{an:"Sn63Pb37 bleihaltig",schmelz:"183 °C",tool:"Lötkolben 300–330 °C",note:"Eutektisch (schmilzt/erstarrt an einem Punkt), verzeiht am meisten"},
{an:"Sn60Pb40 bleihaltig",schmelz:"183–190 °C",tool:"Lötkolben 300–330 °C",note:"Sehr gängig, gut benetzend"},
{an:"SAC305 bleifrei",schmelz:"217–220 °C",tool:"Lötkolben 330–370 °C",note:"RoHS-Standard, heißere Spitze nötig"},
{an:"Sn99,3Cu0,7 bleifrei",schmelz:"227 °C",tool:"Lötkolben 350–380 °C",note:"Günstig, fließt etwas zäher"},
{an:"Heißluft SMD bleihaltig",schmelz:"—",tool:"Luft 280–320 °C",note:"Luftstrom niedrig halten"},
{an:"Heißluft SMD bleifrei",schmelz:"—",tool:"Luft 320–360 °C",note:"Nachbarn mit Kapton schützen"},
{an:"Reflow-Peak bleihaltig",schmelz:"—",tool:"Platte 205–215 °C",note:"Kurz über den Schmelzpunkt"},
{an:"Reflow-Peak bleifrei",schmelz:"—",tool:"Platte 240–250 °C",note:"Profil einhalten"},
{an:"Schrumpfschlauch",schmelz:"—",tool:"Luft 100–150 °C",note:"Niedrig, sonst verbrennt der Schlauch"}
];
buildSortable("tempTbl",
[{k:"an",l:"Anwendung / Lot"},{k:"schmelz",l:"Schmelzpunkt"},{k:"tool",l:"Werkzeug-Temperatur"},{k:"note",l:"Notiz"}],
TEMP);

/* ---------- FEHLER-TABELLE ---------- */
const ERR=[
{f:"Kalte Lötstelle",s:"Kugelig, körnig-rissig, schlecht benetzt — Lot sitzt auf, statt zu fließen",l:"Frisches Flussmittel dazu, beide Teile richtig erwärmen, neu aufschmelzen"},
{f:"Lötbrücke",s:"Zwei Pins/Pads ungewollt verbunden",l:"Flussmittel auftragen, Überschuss mit Entlötlitze abziehen"},
{f:"Spitze benetzt nicht",s:"Lot perlt ab, keine Wärmeübertragung",l:"Spitze oxidiert: Tip Tinner, neu verzinnen, nie trocken heiß stehen lassen"},
{f:"Tombstoning (Grabstein)",s:"Chip stellt sich beim Reflow senkrecht auf",l:"Pads gleichmäßig erwärmen, Pastenmenge und Pad-Design prüfen"},
{f:"Lifted Pad",s:"Kupferpad reißt von der Platine ab",l:"Weniger Hitze und Zeit, nicht hebeln, nie zu lange auf einer Stelle bleiben"},
{f:"Kein Durchgang",s:"Verbindung trotz Lötstelle tot",l:"Kalte Stelle oder Haarriss: mit Flussmittel nachlöten, mit Multimeter prüfen"},
{f:"Bauteil überhitzt",s:"Verfärbung, IC funktioniert nicht mehr",l:"Niedrigere Temperatur, kürzer arbeiten, empfindliche Teile zuletzt löten"},
{f:"Viel Rauch, Spritzer",s:"Flussmittel verbrennt sofort",l:"Temperatur zu hoch oder zu lange drauf — niedriger ansetzen"},
{f:"Gerissene BGA-Kugel",s:"Fehler kommt und geht, ändert sich mit Wärme, Druck oder Lage",l:"Vergleichsmessung im Diodenmodus, Wärme-/Drucktest — dann Chip ausbauen und reballen"},
{f:"Litze saugt nicht",s:"Lot bleibt liegen, Litze wird nur heiß",l:"Litze zu lang (zieht Wärme ab), Flussmittel verbraucht oder Spitze zu klein — kurzes Stück, Flux dazu, breitere Spitze"},
{f:"Flux klebt und lässt sich nicht abwischen",s:"Zähe, harzige Kruste zwischen Bauteilen",l:"Mit Heißluft bei ca. 150–160 °C wieder verflüssigen, sofort mit IPA und fusselfreiem Tuch abnehmen"}
];
buildSortable("errTbl",
[{k:"f",l:"Problem"},{k:"s",l:"Symptom"},{k:"l",l:"Lösung"}],
ERR);

/* ---------- BAUTEIL-TABELLE (Filter + Suche) ---------- */
const COMP=[
{n:"Widerstand / Folien-C (THT)",typ:"THT",pol:"nein",pitch:"groß",diff:1,tool:"Lötkolben",note:"Idealer Einstieg, ungepolt"},
{n:"Elko (THT)",typ:"THT",pol:"ja",pitch:"groß",diff:1,tool:"Lötkolben",note:"Minusstreifen markiert, Polung beachten"},
{n:"LED / Diode (THT)",typ:"THT",pol:"ja",pitch:"groß",diff:1,tool:"Lötkolben",note:"Kathode markiert, längeres Bein = Plus (LED)"},
{n:"Transistor TO-92 / TO-220",typ:"THT",pol:"ja",pitch:"groß",diff:1,tool:"Lötkolben",note:"Pinbelegung aus dem Datenblatt"},
{n:"DIP-IC (THT)",typ:"THT",pol:"ja",pitch:"2,54 mm",diff:1,tool:"Lötkolben",note:"Kerbe oder Punkt = Pin 1"},
{n:"Stift- / Buchsenleiste",typ:"THT",pol:"nein",pitch:"2,54 mm",diff:1,tool:"Lötkolben",note:"Erst Eckpin tacken, dann ausrichten"},
{n:"Chip 1206",typ:"SMD",pol:"teils",pitch:"groß",diff:1,tool:"Lötkolben",note:"Größtes Chip-Format, sehr gut von Hand"},
{n:"Chip 0805",typ:"SMD",pol:"teils",pitch:"groß",diff:1,tool:"Lötkolben",note:"Einsteigerfreundlich für SMD"},
{n:"Chip 0603",typ:"SMD",pol:"teils",pitch:"klein",diff:2,tool:"Lötkolben",note:"Mit etwas Übung gut machbar"},
{n:"Chip 0402",typ:"SMD",pol:"teils",pitch:"sehr klein",diff:3,tool:"Heißluft / Reflow",note:"Pinzette und ruhige Hand nötig"},
{n:"Chip 0201",typ:"SMD",pol:"teils",pitch:"winzig",diff:3,tool:"Reflow",note:"Von Hand kaum sinnvoll"},
{n:"SOT-23",typ:"SMD",pol:"ja",pitch:"groß",diff:1,tool:"Lötkolben",note:"Kleiner Transistor, einfach"},
{n:"SOIC / SOP",typ:"SMD",pol:"ja",pitch:"1,27 mm",diff:1,tool:"Lötkolben",note:"Breite Pins, gut lötbar"},
{n:"TSSOP",typ:"SMD",pol:"ja",pitch:"0,65 mm",diff:2,tool:"Lötkolben (Drag)",note:"Flussmittel und Litze helfen"},
{n:"QFP / TQFP",typ:"SMD",pol:"ja",pitch:"0,4–0,8 mm",diff:2,tool:"Lötkolben (Drag) / Heißluft",note:"Drag-Soldering ideal"},
{n:"QFN / DFN",typ:"SMD",pol:"ja",pitch:"0,4–0,65 mm",diff:3,tool:"Heißluft / Reflow",note:"Pads unter dem Gehäuse, mit dem Kolben kaum erreichbar"},
{n:"BGA",typ:"SMD",pol:"ja",pitch:"0,3–1,0 mm",diff:3,tool:"Heißluft / Reflow",note:"Lötkugeln unter dem Chip — nur mit Vorwärmung und Erfahrung. Ausbau und neue Kugeln: Tab Reballing"}
];
const compCols=[
{k:"n",l:"Bauteil"},{k:"typ",l:"Typ"},{k:"pol",l:"Gepolt"},{k:"pitch",l:"Pitch / Raster"},
{k:"diff",l:"Schwierigkeit",diff:1},{k:"tool",l:"Empfohlen"},{k:"note",l:"Notiz"}
];
const COMPF=[{k:"all",l:"Alle"},{k:"THT",l:"THT"},{k:"SMD",l:"SMD"}];
let cFilter="all",cSort="n",cDir=1;
const cfiltDiv=document.getElementById("cfilt");
COMPF.forEach(f=>{
const b=document.createElement("button");b.textContent=f.l;b.className=f.k==="all"?"active":"";
b.onclick=()=>{cFilter=f.k;cfiltDiv.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderComp()};
cfiltDiv.appendChild(b);
});
document.getElementById("cq").addEventListener("input",renderComp);
function diffPill(d){const cls="d"+d;const lbl=d===1?"einfach":d===2?"mittel":"schwer";return '<span class="diff '+cls+'">'+lbl+'</span>';}
function renderComp(){
const q=document.getElementById("cq").value.toLowerCase();
let data=COMP.filter(c=>(cFilter==="all"||c.typ===cFilter)&&(!q||(c.n+" "+c.note+" "+c.tool+" "+c.typ+" "+c.pitch).toLowerCase().includes(q)));
data.sort((a,b)=>{let av=a[cSort],bv=b[cSort];if(typeof av==="string")return cDir*av.localeCompare(bv,"de",{numeric:true});return cDir*(av-bv)});
const th="<tr>"+compCols.map(c=>'<th onclick="csort(\''+c.k+'\')">'+c.l+'<span class="ar">'+(cSort===c.k?(cDir===1?"▲":"▼"):"")+'</span></th>').join("")+"</tr>";
document.querySelector("#compTbl thead").innerHTML=th;
let tb="";
data.forEach(c=>{
tb+="<tr>";
compCols.forEach(col=>{
if(col.diff){tb+="<td>"+diffPill(c.diff)+"</td>";}
else if(col.k==="typ"){const bc=c.typ==="THT"?"b-kolben":"b-all";tb+='<td><span class="b '+bc+'">'+c.typ+'</span></td>';}
else{tb+="<td>"+c[col.k]+"</td>";}
});
tb+="</tr>";
});
document.querySelector("#compTbl tbody").innerHTML=tb;
if(window.__prepTables)window.__prepTables(document.getElementById("compTbl"));
}
window.csort=function(k){if(cSort===k)cDir*=-1;else{cSort=k;cDir=1}renderComp()};
renderComp();

/* ---------- generischer sortierbarer Tabellen-Builder ---------- */
function buildSortable(id,cols,rows){
let sc=cols[0].k,sd=1;
function r(){
const data=[...rows].sort((a,b)=>{let av=a[sc],bv=b[sc];return sd*String(av).localeCompare(String(bv),"de",{numeric:true})});
const th="<tr>"+cols.map(c=>'<th data-k="'+c.k+'">'+c.l+'<span class="ar">'+(sc===c.k?(sd===1?"▲":"▼"):"")+'</span></th>').join("")+"</tr>";
document.querySelector("#"+id+" thead").innerHTML=th;
document.querySelectorAll("#"+id+" thead th").forEach(t=>t.onclick=()=>{const k=t.getAttribute("data-k");if(sc===k)sd*=-1;else{sc=k;sd=1}r()});
let tb="";data.forEach(row=>{tb+="<tr>"+cols.map(c=>"<td>"+row[c.k]+"</td>").join("")+"</tr>"});
document.querySelector("#"+id+" tbody").innerHTML=tb;
if(window.__prepTables)window.__prepTables(document.getElementById(id));
}
r();
}

(function(){
/* ---------- Faltbare Abschnitte in langen Tabs ---------- */
(function(){
const MIN=5;                       // ab so vielen h2 wird gefaltet
function build(sec){
  if(!sec||sec.dataset.folded)return;
  let TAG="H2", hs=[...sec.querySelectorAll(":scope > h2")].filter(h=>!h.classList.contains("msec-t"));
  if(hs.length<MIN){const h3=[...sec.querySelectorAll(":scope > h3")];if(h3.length>=4){TAG="H3";hs=h3;}}
  if(hs.length<4){sec.dataset.folded="no";return;}
  sec.dataset.folded="yes";
  hs.forEach((h,i)=>{
    const body=document.createElement("div");
    body.className="sec-body"+(i===0?" open":"");
    let n=h.nextSibling;
    while(n&&!(n.nodeType===1&&n.tagName===TAG)){const nx=n.nextSibling;body.appendChild(n);n=nx;}
    h.after(body);
    h.classList.add("fold");if(i===0)h.classList.add("open");
    h.setAttribute("role","button");h.setAttribute("tabindex","0");
    const tog=()=>{h.classList.toggle("open");body.classList.toggle("open");};
    h.addEventListener("click",tog);
    h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tog();}});
  });
  const bar=document.createElement("div");bar.className="foldbar";
  const btn=document.createElement("button");btn.type="button";btn.textContent="Alle aufklappen";
  btn.onclick=()=>{
    const allOpen=hs.every(h=>h.classList.contains("open"));
    hs.forEach(h=>{h.classList.toggle("open",!allOpen);
      const b=h.nextElementSibling;if(b&&b.classList.contains("sec-body"))b.classList.toggle("open",!allOpen);});
    btn.textContent=allOpen?"Alle aufklappen":"Alle zuklappen";
  };
  bar.appendChild(btn);sec.insertBefore(bar,sec.firstChild);
}
window.__openSection=function(id){
  const el=document.getElementById(id);if(!el)return;
  const h=el.classList&&el.classList.contains("fold")?el:el.closest(".sec-body")?.previousElementSibling;
  if(h&&h.classList.contains("fold")&&!h.classList.contains("open")){
    h.classList.add("open");
    const b=h.nextElementSibling;if(b&&b.classList.contains("sec-body"))b.classList.add("open");
  }
  const box=el.closest(".sec-body");
  if(box&&!box.classList.contains("open")){
    box.classList.add("open");
    const ph=box.previousElementSibling;if(ph&&ph.classList.contains("fold"))ph.classList.add("open");
  }
};
function run(){document.querySelectorAll(".msec").forEach(build);}
run();
})();
})();

/* ---------- Tabellen fuer schmale Displays vorbereiten ----------
   Spaltennamen aus dem <thead> an jede Zelle haengen (data-l) und
   ueberwiegend numerische Zellen markieren, damit Messwerte beim
   Ueberfliegen aus der Prosa herausstechen. */
window.__prepTables = function(root){
  (root||document).querySelectorAll("table").forEach(tb=>{
    const th = [...tb.querySelectorAll("thead th")].map(x=>x.textContent.replace(/\s+/g," ").trim());
    tb.querySelectorAll("tbody tr").forEach(tr=>{
      [...tr.children].forEach((td,i)=>{
        if(!td.hasAttribute("colspan") && th[i]) td.setAttribute("data-l", th[i]);
        const t = td.textContent.trim();
        /* kurz, enthaelt eine Ziffer, ist kein Fliesstext */
        if(i>0 && t.length<=26 && /\d/.test(t) && t.split(" ").length<=5) td.classList.add("numcell");
        else td.classList.remove("numcell");
      });
    });
  });
};
window.__prepTables();
