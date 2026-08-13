/* Modul-Skript Lumix S1 II — Faltabschnitte + Tabellen-Aufbereitung.
   Gleiche Mechanik wie mod-elektronik.js, ohne Rechner. */
(function(){
const MIN=4; // ab so vielen Überschriften wird ein Tab gefaltet

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

document.querySelectorAll(".msec").forEach(build);
})();

/* Spaltennamen aus dem <thead> an jede Zelle haengen (data-l) und kurze
   Zahlenzellen markieren, damit Werte beim Ueberfliegen herausstechen. */
window.__prepTables = function(root){
  (root||document).querySelectorAll("table").forEach(tb=>{
    const th = [...tb.querySelectorAll("thead th")].map(x=>x.textContent.replace(/\s+/g," ").trim());
    tb.querySelectorAll("tbody tr").forEach(tr=>{
      [...tr.children].forEach((td,i)=>{
        if(!td.hasAttribute("colspan") && th[i]) td.setAttribute("data-l", th[i]);
        const t = td.textContent.trim();
        if(i>0 && t.length<=26 && /\d/.test(t) && t.split(" ").length<=5) td.classList.add("numcell");
        else td.classList.remove("numcell");
      });
    });
  });
};
window.__prepTables();
