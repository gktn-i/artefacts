/* ============================================================================
   LÖTEN · Modul-Skript (nativ)
   Alle Tabellen stehen server-gerendert im HTML (Volltextsuche, ohne JS
   lesbar). Hier nur Verhalten: Sortieren, Bauteil-Filter, Faltabschnitte.
   Tab-System und App-Shell liefert das Layout.
   ========================================================================== */

/* ---------- Sortierbare Tabellen: <table data-sort> ---------- */
(function(){
  function key(td){
    if(!td)return "";
    return td.hasAttribute("data-v") ? td.getAttribute("data-v") : td.textContent.trim();
  }
  document.querySelectorAll("table[data-sort]").forEach(tb=>{
    const ths=[...tb.querySelectorAll("thead th")];
    const body=tb.tBodies[0];
    let col=-1, dir=1;
    ths.forEach((th,i)=>{
      const ar=document.createElement("span");ar.className="ar";ar.setAttribute("aria-hidden","true");
      th.appendChild(ar);
      th.tabIndex=0;
      const go=()=>{
        dir = col===i ? -dir : 1; col=i;
        const rows=[...body.rows];
        rows.sort((a,b)=>dir*key(a.cells[i]).localeCompare(key(b.cells[i]),"de",{numeric:true}));
        rows.forEach(r=>body.appendChild(r));
        ths.forEach((t,j)=>{
          t.querySelector(".ar").textContent = j===i ? (dir===1?"▲":"▼") : "";
          if(j===i)t.setAttribute("aria-sort",dir===1?"ascending":"descending");else t.removeAttribute("aria-sort");
        });
      };
      th.addEventListener("click",go);
      th.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
    });
  });
})();

/* ---------- Bauteil-Tabelle: Typ-Filter + Suche ---------- */
(function(){
  const bar=document.querySelector(".mx-loeten .cfbar");
  const tb=document.getElementById("compTbl");
  if(!bar||!tb)return;
  bar.hidden=false;
  const q=document.getElementById("cq");
  const empty=document.getElementById("cqEmpty");
  const btns=[...bar.querySelectorAll("#cfilt button")];
  let typ="all";
  function apply(){
    const s=q.value.trim().toLowerCase();
    let n=0;
    [...tb.tBodies[0].rows].forEach(r=>{
      const ok=(typ==="all"||r.dataset.typ===typ)&&(!s||r.textContent.toLowerCase().includes(s));
      r.hidden=!ok; if(ok)n++;
    });
    if(empty)empty.hidden=n>0;
  }
  btns.forEach(b=>b.addEventListener("click",()=>{
    typ=b.dataset.f;
    btns.forEach(x=>{const on=x===b;x.classList.toggle("active",on);x.setAttribute("aria-pressed",on?"true":"false");});
    apply();
  }));
  q.addEventListener("input",apply);
})();

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
    h.setAttribute("aria-expanded",i===0?"true":"false");
    const tog=()=>{const o=h.classList.toggle("open");body.classList.toggle("open",o);h.setAttribute("aria-expanded",o?"true":"false");};
    h.addEventListener("click",tog);
    h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tog();}});
  });
  const bar=document.createElement("div");bar.className="foldbar";
  const btn=document.createElement("button");btn.type="button";btn.textContent="Alle aufklappen";
  btn.onclick=()=>{
    const allOpen=hs.every(h=>h.classList.contains("open"));
    hs.forEach(h=>{h.classList.toggle("open",!allOpen);h.setAttribute("aria-expanded",allOpen?"false":"true");
      const b=h.nextElementSibling;if(b&&b.classList.contains("sec-body"))b.classList.toggle("open",!allOpen);});
    btn.textContent=allOpen?"Alle aufklappen":"Alle zuklappen";
  };
  bar.appendChild(btn);sec.insertBefore(bar,sec.firstChild);
}
window.__openSection=function(id){
  const el=document.getElementById(id);if(!el)return;
  const h=el.classList&&el.classList.contains("fold")?el:el.closest(".sec-body")?.previousElementSibling;
  if(h&&h.classList.contains("fold")&&!h.classList.contains("open")){
    h.classList.add("open");h.setAttribute("aria-expanded","true");
    const b=h.nextElementSibling;if(b&&b.classList.contains("sec-body"))b.classList.add("open");
  }
  const box=el.closest(".sec-body");
  if(box&&!box.classList.contains("open")){
    box.classList.add("open");
    const ph=box.previousElementSibling;if(ph&&ph.classList.contains("fold")){ph.classList.add("open");ph.setAttribute("aria-expanded","true");}
  }
};
document.querySelectorAll(".msec").forEach(build);
})();

/* ---------- Tabellen fuer schmale Displays vorbereiten ----------
   Spaltennamen aus dem <thead> an jede Zelle haengen (data-l) und
   ueberwiegend numerische Zellen markieren, damit Messwerte beim
   Ueberfliegen aus der Prosa herausstechen. */
window.__prepTables = function(root){
  (root||document).querySelectorAll(".mx-loeten table").forEach(tb=>{
    const th = [...tb.querySelectorAll("thead th")].map(x=>x.textContent.replace(/[▲▼]/g,"").replace(/\s+/g," ").trim());
    const carry=[];                  /* offene rowspans je Spalte */
    tb.querySelectorAll("tbody tr").forEach(tr=>{
      let c=0;
      [...tr.children].forEach(td=>{
        while(carry[c]>0){carry[c]--;c++;}
        const cs=td.colSpan||1, rs=td.rowSpan||1;
        const l=th.slice(c,c+cs).filter(Boolean).join(" / ");
        if(l) td.setAttribute("data-l", l); else td.removeAttribute("data-l");
        const t = td.textContent.trim();
        /* kurz, enthaelt eine Ziffer, ist kein Fliesstext */
        if(c>0 && t.length<=26 && /\d/.test(t) && t.split(" ").length<=5) td.classList.add("numcell");
        else td.classList.remove("numcell");
        if(rs>1)for(let k=0;k<cs;k++)carry[c+k]=rs-1;
        c+=cs;
      });
      for(let k=c;k<carry.length;k++)if(carry[k]>0)carry[k]--;
    });
  });
};
window.__prepTables();
