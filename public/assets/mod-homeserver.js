/* Modul-Skript (nativ) — Funktions-JS aus homeserver-101.html; Tab-/View-Code entfaellt. */
/* Stromkosten-Rechner */
function calcStrom(){
 const w=parseFloat(document.getElementById("c-watt").value)||0;
 const p=parseFloat(document.getElementById("c-preis").value)||0;
 const kwh=w*24*365/1000;
 const jahr=kwh*p;
 document.getElementById("c-res").innerHTML=
  `≈ <b>${kwh.toFixed(0)} kWh/Jahr</b> → <b>${jahr.toFixed(2)} €/Jahr</b> (${(jahr/12).toFixed(2)} €/Monat)`;
}
["c-watt","c-preis"].forEach(id=>document.getElementById(id).addEventListener("input",calcStrom));
calcStrom();
