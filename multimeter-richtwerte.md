# Multimeter · Richtwerte für Board-Level-Diagnose

Richtwerte für die Fehlersuche an bestückten Platinen. Alle Diodenmodus- und
Widerstandsmessungen gelten **stromlos**, Akku ab, Netzteil ab, Elkos entladen.
Schwarze Prüfspitze bei Messungen gegen Masse immer auf GND.

---

## Was die drei Modi tatsächlich tun

| Modus | Was das Messgerät macht | Anzeige | Wofür auf dem Board |
|---|---|---|---|
| **Diodenmodus** | legt 1–3 V Leerlaufspannung an, treibt ca. 0,5–1 mA | Spannungsabfall in V / mV | **Der Standardmodus.** Unterscheidet noch dort, wo Ω längst 0 anzeigt |
| **Widerstand** (Ω) | kleine Prüfspannung (in den unteren Bereichen meist < 0,4 V, damit keine Halbleiter aufsteuern) | Ω | Durchgang, Sicherungen, Wicklungen |
| **Kapazität** | lädt und entlädt das Bauteil, rechnet aus der Zeit | F / µF / nF | Nur sinnvoll bei **ausgelöteten** Bauteilen |

> Der Diodenmodus zeigt bei Halbleitern eine Flussspannung, bei allem anderen
> praktisch den Spannungsabfall über den Widerstand. Deshalb sind an einer Rail
> gegen Masse Werte wie 0,3 V völlig normal — dort hängen dutzende
> Halbleiterübergänge parallel.

---

## 1. Richtwerte-Tabelle

| Bauteil | Messmodus | Typischer Wert | Verdächtiger Wert | Bemerkung |
|---|---|---|---|---|
| **Halbleiterübergänge** | | | | |
| PN-Diode Silizium (1N4148, 1N400x) | Diode, Durchlass | 0,55–0,75 V | < 0,3 V · 0,000 V · OL | 0,000 V = durchlegiert, OL in beide Richtungen = unterbrochen |
| PN-Diode Silizium | Diode, Sperrichtung | OL | jeder endliche Wert | Auf dem Board verhindern Parallelpfade oft das OL → im Zweifel einseitig auslöten |
| BJT Basis–Emitter / Basis–Kollektor | Diode | 0,55–0,75 V | < 0,4 V · OL | NPN: rot an Basis. PNP: schwarz an Basis |
| BJT Kollektor–Emitter | Diode | OL in beide Richtungen | jeder endliche Wert | Ein Wert in beide Richtungen = durchlegiert |
| Z-Diode | Diode, Durchlass | 0,55–0,75 V | 0,000 V | Die Z-Spannung misst kein DMM — dafür Netzteil mit Strombegrenzung + Vorwiderstand |
| LED | Diode | 1,6–3,4 V **oder** OL | 0,000 V | Viele DMM liefern nur ~2 V Prüfspannung → blaue/weiße LED zeigt OL, obwohl sie heil ist |
| Germanium-Diode | Diode, Durchlass | 0,2–0,4 V | 0,000 V | Nur in Altgeräten, nicht mit Schottky verwechseln |
| **Schottky-Dioden** | | | | |
| Schottky, einzeln | Diode, Durchlass | 0,15–0,45 V | 0,000 V · OL | Niedriger Wert ist **normal**, kein Teilkurzschluss |
| Schottky, einzeln | Diode, Sperrichtung | OL, oft aber ein hoher Restwert | 0,000 V | Schottky hat prinzipbedingt mehr Sperrstrom — "nicht ganz OL" ist hier kein Defekt |
| Schottky als Verpolschutz / ORing in der Versorgung | Diode | 0,2–0,4 V | 0,000 V | Durchlegierte Verpolschutzdiode ist eine der häufigsten Ursachen für eine kurzgeschlossene Eingangsrail |
| **MOSFET** (N-Kanal, Anreicherung) | | | | |
| Body-Diode: rot an **S**, schwarz an **D** | Diode | 0,4–0,7 V | 0,000 V · OL | Vor jeder Messung Gate gegen Source kurzschließen (Gate entladen) |
| rot an **D**, schwarz an **S** | Diode | OL | 0,000 V · < 0,1 V | Wert in **beide** Richtungen = durchlegiert. Das mit Abstand häufigste FET-Ausfallbild |
| Gate gegen Source und Gate gegen Drain | Diode oder Ω | OL | jeder Wert unter ~1 MΩ | Gate-Durchschlag. Vorher entladen, sonst misst man die Gate-Ladung |
| Schalttest: G kurz mit **rot** antippen | Diode | D–S wird danach niederohmig | keine Änderung | Beweist, dass der FET schaltet. Danach G–S wieder kurzschließen |
| P-Kanal-MOSFET | Diode | wie oben, **alle Polaritäten vertauscht** | — | Body-Diode zeigt von Drain nach Source |
| **Sicherungen** | | | | |
| Schmelzsicherung / SMD-Sicherung | Ω | 0,00–0,5 Ω | OL | Bei Parallelpfaden einseitig auslöten |
| Schmelzsicherung, in-circuit | Diode | 0,000–0,005 V | jeder Wert > 0,05 V | Schneller als Ω, weil die Auflösung im mV-Bereich liegt |
| Rückstellbare Sicherung (PTC / Polyfuse) | Ω | 0,05–2 Ω kalt | OL · > 10 Ω | Ausgelöster PTC ist hochohmig und wird erst nach dem Abkühlen wieder normal |
| **Spulen und Ferrite** | | | | |
| Ferritperle (Bead) | Ω | 0,00–1 Ω | OL | Typisches Ausfallbild: unterbrochen nach Überstrom. Der Ω-Wert sagt **nichts** über die HF-Wirkung |
| Speicherdrossel eines Buck-Wandlers | Ω | 0,00–0,10 Ω, meist unter der Auflösung | OL | Praktisch nicht von einem Kurzschluss zu unterscheiden — REL/Zero gegen den Leitungswiderstand nutzen |
| Trafo-, Relais-, Motorwicklung | Ω | einige Ω bis einige kΩ | OL · deutlich unter der Vergleichswicklung | **Windungsschluss zeigt der Ω-Modus nicht** — dafür Vergleich mit identischer Wicklung oder LCR |
| Spule / Ferrit allgemein | Diode | 0,000–0,020 V | > 0,05 V | Verhält sich im Diodenmodus wie ein Stück Draht |
| **Elkos** | | | | |
| Elko, ausgelötet | Kapazität | Nennwert **±20 %** | mehr als −20 % · stark schwankend | Vorher entladen, sonst Fehlanzeige oder Schaden am Messgerät |
| Elko, in-circuit | Kapazität | Summe aller parallelen Kondensatoren | — | Misst nie ein Einzelbauteil — nur als Vergleich zwischen zwei Boards brauchbar |
| Elko | Ω | Wert steigt sichtbar an, dann OL | konstant niederohmig | Der Ladetest. Bleibt der Wert klein: defekt oder niederohmig überbrückt |
| Elko | Diode | Anzeige läuft von 0 hoch | 0,000 V konstant | Gleiches Prinzip, feinere Auflösung |
| **ESR** eines Elkos | — | vom DMM **nicht messbar** | — | Ein alter Elko kann die volle Nennkapazität und trotzdem viel zu hohen ESR haben → ESR-Meter |
| **Keramikkondensatoren (MLCC)** | | | | |
| MLCC, ausgelötet | Kapazität | Nennwert ±10–20 % | 0 · weit daneben | Werte unter ~1 nF liegen unter der Auflösung vieler DMM |
| MLCC | Diode / Ω | OL | 0,000 V · wenige Ω | Gerissener MLCC = satter Kurzschluss. Nach Sturz oder Board-Verbiegung der häufigste Rail-Killer |
| MLCC, in-circuit | Kapazität | Summe der Rail-Kapazität | — | Nur im Vergleich aussagekräftig |
| **Spannungsrails gegen Masse** (schwarz an GND) | | | | |
| Logik-Rail 5 V / 3,3 V / 1,8 V | Diode | 0,3–0,6 V | 0,000–0,010 V | Der Standardtest auf Rail-Kurzschluss |
| Core-/GPU-/SoC-Rail (< 1,2 V) | Diode | 0,05–0,30 V | 0,000–0,005 V | Von Haus aus niedrig, weil viele Kondensatoren und Halbleiter parallel hängen — **nicht** mit einem Kurzschluss verwechseln |
| Eingangs- / Akkurail | Diode | 0,3–0,7 V | 0,000 V | 0,000 V hier heißt fast immer: Verpolschutz, Eingangs-FET oder ein MLCC ist durch |
| beliebige Rail | Ω | einige Ω bis kΩ | < 1–2 Ω | Gröber als der Diodenmodus, aber gut für den schnellen Ja/Nein-Blick |
| beliebige Rail, im Betrieb | V⎓ | Nennwert ±5 % | fehlt · zu niedrig · schwankt | Erst messen, wenn stromlos nichts Auffälliges gefunden wurde |

> **0,000 V im Diodenmodus** ist die einzige Anzeige, die für sich allein schon
> eine Aussage ist: an dieser Stelle liegt ein echter Kurzschluss. Alles andere
> braucht einen Vergleichswert.

---

## 2. Messreihenfolge bei der Fehlersuche

Immer von der Quelle Richtung Verbraucher. Wer mitten im Board anfängt, misst
Folgefehler.

| # | Schritt | Modus | Erwartung | Wenn abweichend |
|---|---|---|---|---|
| 1 | **Eingangsspannung** am Stecker, hinter Sicherung und Verpolschutz | V⎓, stromlos vorher Diode gegen GND | Nennwert; Diodenwert 0,3–0,7 V | 0,000 V → Kurzschluss vor allem anderen suchen. Kein Eingang → Netzteil, Kabel, Buchse, Sicherung |
| 2 | **Hauptrail** (Ausgang des ersten Wandlers, z. B. 5 V oder 3,3 V) | V⎓ | Nennwert ±5 % | Fehlt sie: Wandler-IC, Speicherdrossel, High-/Low-Side-FET und Eingang des Wandlers prüfen |
| 3 | **Abgeleitete Rails** (1,8 V, 1,2 V, Core, I/O, PLL …) der Reihe nach | V⎓, vorher Diode gegen GND | jeweils Nennwert | Eine einzelne tote Rail → deren Wandler oder LDO. Alle tot → gemeinsames Enable oder die Hauptrail bricht ein |
| 4 | **Enable und Feedback** an jedem Wandler, der nicht anläuft | V⎓ | EN: High-Pegel der Steuerlogik · FB: Referenzspannung des ICs (oft 0,6–1,25 V, Datenblatt) | EN fehlt → Ursache liegt **vor** dem Wandler (Sequencer, PMIC, Reset). FB daneben → Teiler, Rückkoppelwiderstand oder Last |
| 5 | **Datensignale und Takt** (Reset, Takt, I²C/SPI, Bus) | V⎓, Oszilloskop | Reset High, Takt vorhanden, I²C-Pegel per Pull-up auf Rail-Niveau | Erst sinnvoll, wenn alle Rails stehen. Vorher misst man nur, dass nichts läuft |

**Kurzschluss eingrenzen**, wenn Schritt 1 oder 3 eine Rail bei 0,000 V zeigt:

| Methode | Vorgehen | Erkennt |
|---|---|---|
| Injection / Spannungsabfall | Labornetzteil strombegrenzt (0,5–2 A) auf die Rail, mit dem DMM im mV-Bereich den Spannungsabfall entlang der Rail verfolgen | Der Wert wird zum Fehler hin **kleiner** — dort sitzt das Bauteil |
| Wärmebild oder Fingerprobe | Rail strombegrenzt speisen, fühlen oder Wärmebildkamera | Das defekte Bauteil wird als erstes warm |
| Sektionieren | Ferritperlen, 0-Ω-Brücken und Sicherungen auslöten, Rail dabei beobachten | Trennt die Rail in Abschnitte, bis der Kurzschluss verschwindet |

---

## 3. Grenzen der Tabelle

Absolute Richtwerte gelten für **Bauteile**, nicht für **Baugruppen**. Sobald
das Bauteil eingelötet ist, misst man immer die Parallelschaltung von allem,
was an demselben Knoten hängt. Konkret:

| Effekt | Folge für die Messung |
|---|---|
| Parallelpfade auf dem Knoten | Ein intaktes Bauteil kann viel zu niedrig messen, ein defektes viel zu unauffällig |
| ESD-Schutzdioden in ICs | Erzeugen an fast jedem Pin einen Diodenwert gegen GND und gegen VCC — auch wenn dort gar keine Diode eingezeichnet ist |
| Kapazität an der Rail | Der Diodenmodus zeigt erst nach dem Aufladen einen stabilen Wert. Große Rails brauchen ein bis zwei Sekunden |
| Prüfspannung des Messgeräts | Je nach Gerät 1–3 V. Zwei Multimeter zeigen an derselben Stelle unterschiedliche Werte — deshalb Referenzwerte **immer mit demselben Gerät** aufnehmen |
| Temperatur und Restladung | Warme Boards und geladene Elkos verschieben Werte reproduzierbar nach unten bzw. oben |

**Zuverlässiger als jeder absolute Richtwert sind Vergleichsmessungen:**

| Vergleich | Vorgehen | Aussagekraft | Grenze |
|---|---|---|---|
| **Funktionierendes Board** derselben Revision | Denselben Punkt mit demselben Gerät auf beiden Boards messen | **Höchste.** Deckt auch Fehler auf, die man nicht erwartet hätte | Zweites Board nötig, Revision muss stimmen |
| **Symmetrischer Schaltungsblock** auf demselben Board | Kanal A gegen Kanal B, Phase 1 gegen Phase 2 einer Mehrphasen-Versorgung, RAM-Kanal 1 gegen 2, USB-Port 1 gegen 2 | Sehr hoch, ohne zweites Board | Nur wo es Symmetrie gibt. Beide Seiten können gleichzeitig defekt sein |
| **Gleichartige Pins** desselben ICs | Alle GND-Pins, alle VDD-Pins, alle Pins desselben Busses gegeneinander | Hoch für einzelne ausgerissene oder gerissene Verbindungen | Sagt nichts über die Funktion des ICs |
| **Eigene Referenzwerte** vom intakten Gerät | Vor dem ersten Fehler einmal alles vermessen und notieren (Vorlage unten) | Hoch, mit der Zeit die beste Datenbasis | Erfordert Disziplin, bevor etwas kaputt ist |
| **Datenblatt / Boardview** | Sollwerte für EN, FB, Referenzen nachschlagen | Hoch für einzelne Pins | Sagt nichts über Parallelpfade auf dem Board |

**Merksatz:** Ein einzelner Messwert ist eine Beobachtung. Eine Aussage wird
daraus erst durch einen zweiten Wert, mit dem man ihn vergleicht.

---

## 4. Vorlage für eigene Referenzmessungen

Pro Gerätefamilie eine Tabelle. Einmal am **funktionierenden** Gerät aufnehmen,
mit demselben Multimeter, stromlos und entladen.

**Gerät / Familie:** ______________  **Revision:** ______  **Messgerät:** ______________

| Gerät | Messpunkt | Sollwert | gemessen | Datum |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

**Ausfüllhinweise**

| Spalte | Was hineingehört |
|---|---|
| Gerät | Modell **und** Boardrevision — Werte gelten nicht über Revisionen hinweg |
| Messpunkt | Eindeutig benennen: Bauteilkennung und Pin oder Testpunkt, z. B. `C412 / Pad 1`, `U3 Pin 12`, `TP7`. Nicht "irgendwo an 3,3 V" |
| Sollwert | Der am intakten Gerät gemessene Wert **mit Modus**, z. B. `0,42 V Diode` oder `3,31 V ⎓` |
| gemessen | Der Wert im Fehlerfall — Zeile bleibt sonst leer |
| Datum | Damit später nachvollziehbar bleibt, mit welchem Stand und welchem Gerät gemessen wurde |

**Beispielzeile**

| Gerät | Messpunkt | Sollwert | gemessen | Datum |
|---|---|---|---|---|
| XY-Board Rev. B | `L3 / Pad Ausgang` (1,8 V Rail) | 0,38 V Diode gegen GND | 0,002 V | 2026-08-06 |
