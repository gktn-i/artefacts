(function () {
/* Modul-Skript (nativ) — Funktions-JS aus rentabilitaets-simulator.html; Tab-/View-Code entfaellt. */
var SCN = [
  { id:"k", nm:"Konservativ", ds:"Anlauf: viel Konstruktion, wenige Verkäufe", auftraege:8, neuDesigns:4, preis:22 },
  { id:"r", nm:"Realistisch", ds:"Katalog wächst, mehr Wiederholdrucke", auftraege:25, neuDesigns:4, preis:26 },
  { id:"o", nm:"Optimistisch", ds:"Etablierter Katalog, fast nur Wiederholung", auftraege:70, neuDesigns:5, preis:28 }
];
var klein = true;

function num(v){ var n=parseFloat(v); return isFinite(n)?n:0; }
function eur(x){ return (isFinite(x)?x:0).toLocaleString("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}); }
function eur2(x){ return (isFinite(x)?x:0).toLocaleString("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:2}); }
function h1(x){ return (isFinite(x)?x:0).toLocaleString("de-DE",{maximumFractionDigits:1})+" h"; }
function g(id){ return num(document.getElementById(id).value); }

function buildCards(){
  var host = document.getElementById("scn");
  host.innerHTML = SCN.map(function(s){
    return '<div class="card">'
      + '<div class="card-h"><div class="nm">'+s.nm+'</div><div class="ds">'+s.ds+'</div></div>'
      + '<div class="card-b">'
      + '<div class="in2">'
      +   '<div class="field"><label>Aufträge / Monat</label><input type="number" step="any" data-s="'+s.id+'" data-k="auftraege" value="'+s.auftraege+'"><span class="suf">Stk</span></div>'
      +   '<div class="field"><label>Neue Designs / M</label><input type="number" step="any" data-s="'+s.id+'" data-k="neuDesigns" value="'+s.neuDesigns+'"><span class="suf">Stk</span></div>'
      + '</div>'
      + '<div class="field"><label>Ø-Verkaufspreis</label><input type="number" step="any" data-s="'+s.id+'" data-k="preis" value="'+s.preis+'"><span class="suf">€</span></div>'
      + '<div class="big"><div><div class="l">Gewinn / Monat</div><div class="v mono" id="gewinn_'+s.id+'">–</div></div><div><div class="l">Echter Stundenlohn</div><div class="v mono" id="wage_'+s.id+'">–</div></div></div>'
      + '<div>'
      +   '<div class="kv"><span style="color:var(--dim)">Umsatz</span><span class="v" id="umsatz_'+s.id+'"></span></div>'
      +   '<div class="kv"><span style="color:var(--dim)">Material + Ausschuss</span><span class="v" id="material_'+s.id+'"></span></div>'
      +   '<div class="kv"><span style="color:var(--dim)">Strom + Maschine</span><span class="v" id="energy_'+s.id+'"></span></div>'
      +   '<div class="kv"><span style="color:var(--dim)">Plattform + Verpackung</span><span class="v" id="platverp_'+s.id+'"></span></div>'
      +   '<div class="kv"><span style="color:var(--dim)">Deine Arbeitsstunden / M</span><span class="v" id="human_'+s.id+'"></span></div>'
      +   '<div class="kv"><span style="color:var(--dim)">Druckstunden / M</span><span class="v" id="druck_'+s.id+'"></span></div>'
      + '</div>'
      + '<div class="barwrap"><div class="lbl"><span>Druckerauslastung</span><span class="mono" id="auslp_'+s.id+'"></span></div><div class="bar"><span id="auslbar_'+s.id+'"></span></div></div>'
      + '<div class="badge" id="badge_'+s.id+'"></div>'
      + '<div id="notes_'+s.id+'"></div>'
      + '</div></div>';
  }).join("");
}

function compute(s){
  var aus = g("ausschuss")/100;
  var auf = s.auftraege, neu = s.neuDesigns, preis = s.preis;
  var umsatz = auf*preis;
  var druckH = auf*g("druckzeitTeil")*(1+aus);
  var material = auf*g("materialTeil")*(1+aus);
  var strom = druckH*g("watt")/1000*g("stromPreis");
  var maschine = druckH*(g("lebensdauer")>0 ? g("druckerPreis")/g("lebensdauer") : 0);
  var verpack = auf*g("verpackTeil");
  var pf = g("platformPct")/100; if(klein) pf*=1.19;
  var plattform = umsatz*pf;
  var kosten = material+strom+maschine+verpack+plattform;
  var gewinn = umsatz-kosten;
  var humanH = neu*g("cadDesign") + auf*(g("commsAuftrag")+g("postTeil")) + g("adminMonat");
  var wage = humanH>0 ? gewinn/humanH : 0;
  var verfMonat = g("stundenWoche")*4.33;
  var auslastung = g("kapazitaet")>0 ? druckH/g("kapazitaet") : 0;
  return {umsatz:umsatz,druckH:druckH,material:material,strom:strom,maschine:maschine,verpack:verpack,plattform:plattform,gewinn:gewinn,humanH:humanH,wage:wage,verfMonat:verfMonat,zeitOk:humanH<=verfMonat,auslastung:auslastung};
}

function wageColor(w,gw){ return gw<=0?"var(--red)": w<10?"var(--red)": w<18?"var(--yellow)":"var(--green)"; }
function profitColor(gw){ return gw<=0?"var(--red)": gw<400?"var(--yellow)":"var(--green)"; }
function auslColor(a){ return a>0.95?"var(--red)": a>0.7?"var(--yellow)":"var(--green)"; }
function verdict(r){
  if(r.gewinn<=0) return {t:"Trägt sich nicht",c:"var(--red)",bg:"rgba(255,92,92,.10)",b:"rgba(255,92,92,.35)"};
  if(r.wage<10) return {t:"Eher Hobby, das sich selbst trägt",c:"var(--yellow)",bg:"rgba(255,210,63,.08)",b:"rgba(255,210,63,.27)"};
  if(r.gewinn<800) return {t:"Solides Nebeneinkommen",c:"var(--green)",bg:"rgba(63,208,122,.08)",b:"rgba(63,208,122,.27)"};
  if(r.gewinn<1600) return {t:"Starkes Nebeneinkommen, Richtung Teilzeit",c:"var(--green)",bg:"rgba(63,208,122,.10)",b:"rgba(63,208,122,.35)"};
  return {t:"Richtung Haupteinkommen",c:"var(--green)",bg:"rgba(63,208,122,.12)",b:"rgba(63,208,122,.42)"};
}

function render(){
  SCN.forEach(function(s){
    var r = compute(s);
    document.getElementById("gewinn_"+s.id).textContent = eur(r.gewinn);
    document.getElementById("gewinn_"+s.id).style.color = profitColor(r.gewinn);
    var we = document.getElementById("wage_"+s.id);
    we.textContent = r.gewinn>0 ? eur2(r.wage) : "–";
    we.style.color = wageColor(r.wage,r.gewinn);
    document.getElementById("umsatz_"+s.id).textContent = eur(r.umsatz);
    document.getElementById("material_"+s.id).textContent = eur(r.material);
    document.getElementById("energy_"+s.id).textContent = eur(r.strom+r.maschine);
    document.getElementById("platverp_"+s.id).textContent = eur(r.plattform+r.verpack);
    var hm = document.getElementById("human_"+s.id);
    hm.textContent = h1(r.humanH); hm.style.color = r.zeitOk ? "var(--text)" : "var(--red)";
    document.getElementById("druck_"+s.id).textContent = h1(r.druckH);
    document.getElementById("auslp_"+s.id).textContent = Math.round(r.auslastung*100)+" %";
    var bar = document.getElementById("auslbar_"+s.id);
    bar.style.width = Math.min(100,r.auslastung*100)+"%"; bar.style.background = auslColor(r.auslastung);
    var v = verdict(r);
    var bd = document.getElementById("badge_"+s.id);
    bd.textContent = v.t; bd.style.color=v.c; bd.style.background=v.bg; bd.style.border="1px solid "+v.b;
    var notes="";
    if(!r.zeitOk){ notes += '<div class="note" style="color:#ffd0d0;background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.35)"><span>⚠</span><span>Braucht '+h1(r.humanH)+' im Monat, du hast aber nur '+h1(r.verfMonat)+' ('+g("stundenWoche")+' h/Woche). Dieses Volumen ist mit deiner Zeit nicht machbar.</span></div>'; }
    if(r.auslastung>0.95){ notes += '<div class="note" style="color:#ffe9a8;background:rgba(255,210,63,.07);border:1px solid rgba(255,210,63,.27)"><span>⚙</span><span>Drucker am Limit. Ein zweiter Drucker oder eine Farm wird nötig, um mehr zu schaffen.</span></div>'; }
    document.getElementById("notes_"+s.id).innerHTML = notes;
  });
}

document.addEventListener("input", function(e){
  var t = e.target;
  if(t.dataset && t.dataset.s){
    var s = SCN.filter(function(x){return x.id===t.dataset.s;})[0];
    if(s) s[t.dataset.k] = num(t.value);
  }
  render();
});
document.getElementById("kleinToggle").addEventListener("click", function(){
  klein = !klein;
  document.getElementById("kleinTg").className = "tg" + (klein?" on":"");
  render();
});

buildCards();
render();
})();
