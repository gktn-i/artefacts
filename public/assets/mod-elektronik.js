/* ============================================================================
   ELEKTRONIK 101 · Modul-Skript (nativ)
   Komponenten-DB, Rechner, Vergleichsmatrizen, Faltabschnitte und
   Tabellen-Aufbereitung — aus der Legacy-Seite uebernommen.
   ========================================================================== */
/* ---------- KOMPONENTEN ---------- */
const C=[
{n:"Widerstand",cat:"passiv",catL:"Passiv",fn:"Bremst den Strom, erzeugt definierten Spannungsabfall.",app:"Vorwiderstand für LEDs, Pull-up/down, Strombegrenzung, Spannungsteiler.",det:{kenn:"Wert in Ω (z. B. 220 Ω, 10 kΩ), Belastbarkeit meist 0,25 W (1/4 W).",kompat:"Universell, keine Polarität. Wert über Farbringe oder SMD-Code ablesen.",achtung:"Belastbarkeit (Watt) nicht überschreiten, sonst Brandgefahr. Bei hohen Strömen 0,5 W / 1 W nehmen.",bsp:"220 Ω zwischen 5-V-Arduino-Pin und roter LED begrenzen den Strom auf ~14 mA.",tags:["keine Polarität","E-Reihen-Werte"]}},
{n:"Potentiometer",cat:"passiv",catL:"Passiv",fn:"Einstellbarer Widerstand (Drehknopf/Schieber).",app:"Lautstärke, Helligkeit, Sollwert einstellen, Sensor-Abgleich.",det:{kenn:"Endwert in Ω (z. B. 10 kΩ), linear (B) oder logarithmisch (A).",kompat:"3 Anschlüsse: außen die Enden, mitte der Schleifer. Als variabler Spannungsteiler nutzbar.",achtung:"Für Audio log, für lineare Regelung lin. Trimmer = winziges Poti für einmaligen Abgleich.",bsp:"10-kΩ-Poti am Analogeingang: Der Drehknopf stellt die Wunsch-Helligkeit einer Lampe ein.",tags:["lin/log","3 Pins"]}},
{n:"Keramik-Kondensator",cat:"passiv",catL:"Passiv",fn:"Speichert wenig Ladung, reagiert schnell. Glättet/entstört.",app:"Entkopplung neben ICs (100 nF), Filter, Schwingkreise.",det:{kenn:"Meist pF bis µF. Code wie '104' = 100 nF.",kompat:"Keine Polarität, beliebig herum. Spannungsfestigkeit beachten (z. B. 50 V).",achtung:"Spannungsfestigkeit muss über Betriebsspannung liegen.",bsp:"100 nF direkt neben dem Versorgungs-Pin jedes ICs fangen kurze Spannungseinbrüche ab.",tags:["keine Polarität","100 nF Standard"]}},
{n:"Elektrolyt-Kondensator (Elko)",cat:"passiv",catL:"Passiv",fn:"Speichert viel Ladung. Puffert/glättet Versorgungsspannung.",app:"Glättung am Netzteil/Regler, Energiepuffer, Tiefpassfilter.",det:{kenn:"µF bis mF (z. B. 470 µF / 25 V).",kompat:"GEPOLT! Minus ist am Gehäuse markiert (Strich), kürzeres Beinchen = Minus.",achtung:"Falsch herum oder über Spannung = kann aufblähen/platzen. Spannung mit Reserve wählen. Große geladene Elkos vor dem Anfassen entladen (Anleitung: Tab <a href='#sicherheit'>Sicherheit</a>).",bsp:"470 µF am Eingang des Motortreibers puffern die Stromspitzen beim Anlaufen des Motors.",tags:["GEPOLT","Spannung +Reserve"]}},
{n:"Folien-Kondensator",cat:"passiv",catL:"Passiv",fn:"Stabiler, langlebiger Kondensator mittlerer Kapazität.",app:"Audio, Filter, Snubber (Funkenlöscher an Kontakten), Netzentstörung.",det:{kenn:"nF bis µF, hohe Spannungsfestigkeit möglich.",kompat:"Keine Polarität. Größer als Keramik, sehr stabil.",achtung:"Teurer/größer, dafür sehr verlässlich und temperaturstabil.",bsp:"100-nF-Folie parallel zum Relaiskontakt schluckt den Abschaltfunken (Snubber).",tags:["keine Polarität","sehr stabil"]}},
{n:"Spule / Induktivität",cat:"passiv",catL:"Passiv",fn:"Wehrt sich gegen Stromänderungen, speichert Energie magnetisch.",app:"Schaltregler (Buck/Boost), Filter, Funk-Schwingkreise.",det:{kenn:"µH bis mH, dazu max. Strom (Sättigungsstrom).",kompat:"Keine Polarität (bei einfachen Drosseln).",achtung:"Max. Strom nicht überschreiten, sonst Sättigung (die Spule kann nichts mehr speichern) → Wandler bricht ein. Kann Spannungsspitzen erzeugen.",bsp:"Die 47-µH-Spule im Buck-Wandler speichert die Energie zwischen den Schaltimpulsen.",tags:["keine Polarität","max. Strom"]}},
{n:"Diode (z. B. 1N4007)",cat:"halbleiter",catL:"Halbleiter",fn:"Lässt Strom nur in EINE Richtung durch (Einbahnstraße).",app:"Verpolungsschutz, Gleichrichtung, Freilaufdiode an Spulen/Relais.",det:{kenn:"Sperrspannung (V) und Durchlassstrom (A). 1N4007 = 1000 V / 1 A.",kompat:"GEPOLT! Ring markiert die Kathode (Minus-/Ausgangsseite).",achtung:"Im Durchlass fallen ~0,7 V ab. Sperrspannung des Bauteils nicht überschreiten.",bsp:"In Reihe zur Versorgung schützt eine 1N4007 das Board, falls jemand den Akku verpolt ansteckt.",tags:["GEPOLT","Ring = Kathode","~0,7 V Verlust"]}},
{n:"Schottky-Diode",cat:"halbleiter",catL:"Halbleiter",fn:"Diode mit geringem Spannungsabfall (~0,3 V) und schnell.",app:"Verpolungsschutz, Schaltregler, dort wo wenig Verlust zählt.",det:{kenn:"Niedrige Durchlassspannung, hohe Schaltgeschwindigkeit.",kompat:"GEPOLT, Ring = Kathode, wie normale Diode.",achtung:"Höherer Sperrstrom als Standarddiode, niedrigere Sperrspannung.",bsp:"SS34 als Verpolungsschutz vor dem Buck-Modul: nur ~0,3 V Verlust statt 0,7 V.",tags:["GEPOLT","wenig Verlust","schnell"]}},
{n:"Zener-Diode",cat:"halbleiter",catL:"Halbleiter",fn:"Begrenzt Spannung auf festen Wert (lässt rückwärts ab Schwelle durch).",app:"Spannungsbegrenzung, Referenzspannung, einfacher Überspannungsschutz.",det:{kenn:"Zener-Spannung (z. B. 5,1 V) und Leistung.",kompat:"GEPOLT, wird in Sperrrichtung betrieben (umgekehrt zur normalen Diode).",achtung:"Braucht meist Vorwiderstand. Nicht für große Ströme/Leistung.",bsp:"5,1-V-Zener mit Vorwiderstand schützt einen empfindlichen Eingang vor Überspannung.",tags:["GEPOLT","feste Spannung"]}},
{n:"LED",cat:"halbleiter",catL:"Halbleiter",fn:"Leuchtdiode: wandelt Strom in Licht.",app:"Statusanzeige, Beleuchtung, Optokoppler-Eingang.",det:{kenn:"Durchlassspannung je Farbe (rot ~2 V, blau/weiß ~3,2 V), Strom 10 bis 20 mA.",kompat:"GEPOLT! Langes Beinchen = Plus (Anode), abgeflachte Seite = Minus.",achtung:"NIE ohne Vorwiderstand betreiben, sonst sofort durchgebrannt.",bsp:"Status-LED am ESP32: Pin → 330 Ω → LED → GND, leuchtet, sobald das WLAN verbunden ist.",tags:["GEPOLT","Vorwiderstand Pflicht","langes Bein = +"]}},
{n:"Bipolar-Transistor (NPN/PNP)",cat:"halbleiter",catL:"Halbleiter",fn:"Kleiner Steuerstrom schaltet/verstärkt großen Strom.",app:"Schalter für Relais/LED, Signalverstärkung. NPN sehr verbreitet (z. B. BC547, 2N2222).",det:{kenn:"3 Pins: Basis (Steuer), Kollektor, Emitter. Strom-Verstärkung hFE.",kompat:"Basis braucht Vorwiderstand. NPN schaltet gegen Masse, PNP gegen Plus.",achtung:"Pinbelegung je Typ unterschiedlich → Datenblatt. Max. Strom/Spannung beachten.",bsp:"Ein BC547 schaltet einen kleinen 5-V-Summer über einen Arduino-Pin (1-kΩ-Basiswiderstand).",tags:["3 Pins","Basis-Vorwiderstand","NPN/PNP"]}},
{n:"MOSFET",cat:"halbleiter",catL:"Halbleiter",fn:"Spannungsgesteuerter Schalter, verlustarm bei hohen Strömen.",app:"Motoren, LED-Streifen, Power-Schalter per Mikrocontroller-Pin.",det:{kenn:"3 Pins: Gate (Steuer), Drain, Source. N-Kanal am häufigsten.",kompat:"Für 3,3/5 V-Steuerung 'Logic-Level'-Typ wählen, sonst schaltet er nicht voll durch.",achtung:"ESD-empfindlich (Gate). Gate-Widerstand + Pull-down empfohlen. Logic-Level beachten.",bsp:"Ein IRLZ44N (Logic-Level) dimmt einen 12-V-LED-Streifen mit 3 A per PWM vom ESP32.",tags:["Logic-Level wählen","ESD-empfindlich","3 Pins"]}},
{n:"Optokoppler",cat:"halbleiter",catL:"Halbleiter",fn:"Überträgt Signal per Licht, trennt zwei Stromkreise galvanisch (elektrisch).",app:"Sichere Trennung Mikrocontroller ↔ Netzspannung, Störschutz.",det:{kenn:"LED-Eingang + Foto-Transistor-Ausgang in einem Gehäuse.",kompat:"Eingang wie LED behandeln (Vorwiderstand), Ausgang wie Transistor.",achtung:"Beide Seiten haben getrennte Masse - das ist der Sinn der Trennung.",bsp:"Ein PC817 meldet dem Mikrocontroller, ob das 230-V-Gerät läuft — ganz ohne elektrische Verbindung.",tags:["galvanische Trennung","LED-Eingang"]}},
{n:"Linearregler (7805 / LM317 / AMS1117)",cat:"ic",catL:"IC / Aktiv",fn:"Macht aus höherer eine feste niedrigere Spannung (z. B. 5 V, 3,3 V).",app:"Stabile Versorgung für Logik/Mikrocontroller aus Batterie/Netzteil.",det:{kenn:"7805 = fest 5 V, LM317 = einstellbar, AMS1117 = 3,3 V (braucht ~1,1 V mehr am Eingang, also min. ~4,5 V).",kompat:"Ein-/Ausgangs-Kondensatoren laut Datenblatt (z. B. 10 µF + 100 nF).",achtung:"Verheizt Differenz als Wärme → bei großem Abstand Kühlkörper oder Schaltregler.",bsp:"Ein AMS1117-3.3 macht aus den 5 V vom USB die sauberen 3,3 V für ein ESP-Modul.",tags:["Wärme!","Stütz-Kondensatoren"]}},
{n:"Schaltregler / DC-DC (Buck/Boost)",cat:"modul",catL:"Modul",fn:"Wandelt Spannung effizient runter (Buck) oder hoch (Boost).",app:"Wirkungsgrad-Versorgung, Akku auf 5 V hoch, 12 V auf 3,3 V runter.",det:{kenn:"Fertig-Modul (z. B. LM2596 buck, MT3608 boost), oft per Poti einstellbar.",kompat:"Eingangsbereich beachten. Ausgang vor Anschluss mit Multimeter einstellen.",achtung:"Wirkungsgrad ~85-95 %, kaum Wärme. Min./Max. Eingangsspannung einhalten.",bsp:"Ein LM2596-Modul macht aus dem 12-V-Netzteil effiziente 5 V für einen LED-Streifen.",tags:["effizient","Ausgang vorher einstellen"]}},
{n:"555 Timer",cat:"ic",catL:"IC / Aktiv",fn:"Erzeugt Zeitverzögerungen oder Rechteck-Schwingungen (Takt).",app:"Blinker, Tongeber, Zeitschalter, PWM-Erzeugung ohne Mikrocontroller.",det:{kenn:"8-Pin-Klassiker. Frequenz über zwei Widerstände + Kondensator (RC).",kompat:"Sehr robust, 4,5-15 V. CMOS-Variante (7555) für niedrige Ströme.",achtung:"Stützkondensator nicht vergessen. Online-RC-Rechner nutzen.",bsp:"Der Klassiker: 555 mit zwei Widerständen und einem Elko lässt eine LED im Sekundentakt blinken.",tags:["RC bestimmt Zeit","sehr robust"]}},
{n:"Logik-IC (74HCxx)",cat:"ic",catL:"IC / Aktiv",fn:"Grundbausteine digitaler Logik: UND, ODER, NICHT, Zähler usw.",app:"Einfache Steuerungen, Signal-Verknüpfung ohne Mikrocontroller.",det:{kenn:"74HC-Reihe = 2-6 V, sehr verbreitet. Pinbelegung je Typ.",kompat:"Logikpegel der Familie beachten. Unbenutzte Eingänge nicht offen lassen.",achtung:"Entkopplungs-Kondensator (100 nF) Pflicht. Offene Eingänge = Fehlverhalten.",bsp:"Ein 74HC08 (UND) schaltet die Pumpe nur, wenn Timer UND Feuchtesensor gleichzeitig „ja“ sagen.",tags:["100 nF Pflicht","Pegel beachten"]}},
{n:"Schieberegister (74HC595)",cat:"ic",catL:"IC / Aktiv",fn:"Macht aus 3 Steuerleitungen 8 Ausgänge (erweitert Pins).",app:"Viele LEDs/7-Segment-Anzeigen mit wenig Mikrocontroller-Pins ansteuern.",det:{kenn:"Seriell rein, parallel raus. Kaskadierbar (mehrere hintereinander).",kompat:"Arbeitet mit 3,3/5 V Logik. Pro Ausgang LED-Vorwiderstand.",achtung:"Gesamtstrom des Chips begrenzt → nicht alle LEDs auf Vollstrom.",bsp:"Drei Arduino-Pins steuern über zwei hintereinandergeschaltete 74HC595 eine 16-LED-Anzeige.",tags:["Pin-Sparer","kaskadierbar"]}},
{n:"Mikrocontroller (Arduino / ESP32 / RP2040)",cat:"ic",catL:"IC / Aktiv",fn:"Programmierbarer Mini-Computer: liest Sensoren, steuert Ausgänge.",app:"Herzstück fast jedes Hobby-Projekts. ESP32 mit WLAN/Bluetooth.",det:{kenn:"Arduino Uno = 5 V (einsteigerfreundlich). ESP32/RP2040 = 3,3 V, mehr Leistung.",kompat:"PIN-Spannung beachten! ESP32-Pins sind 3,3 V, NICHT 5 V-fest.",achtung:"Pin-Strom begrenzt (~20-40 mA) → Lasten über Transistor/MOSFET schalten.",bsp:"Ein ESP32 liest den BME280 und schickt die Wohnzimmer-Werte per WLAN an Home Assistant.",tags:["3,3 V oder 5 V?","Pin-Strom begrenzt"]}},
{n:"Relais",cat:"mech",catL:"Elektromech.",fn:"Elektrisch gesteuerter mechanischer Schalter (klickt).",app:"Hohe Lasten / Netzspannung mit kleinem Signal schalten, Trennung.",det:{kenn:"Spulenspannung (5 V/12 V) + Schaltkontakt-Belastbarkeit (z. B. 10 A 250 V).",kompat:"Über Transistor/MOSFET ansteuern, NIE direkt am Mikrocontroller-Pin.",achtung:"Freilaufdiode über die Spule Pflicht! Modul-Relais haben das oft schon drauf.",bsp:"Ein 5-V-Relais schaltet die 230-V-Schreibtischlampe über den Smart-Home-Controller.",tags:["Freilaufdiode!","über Transistor"]}},
{n:"Taster / Schalter",cat:"mech",catL:"Elektromech.",fn:"Schließt/öffnet Kontakt. Taster = nur solange gedrückt.",app:"Eingaben, Reset, Modus wählen.",det:{kenn:"Taster (Momentary) oder Schalter (rastend). Strombelastbarkeit beachten.",kompat:"Braucht Pull-up oder Pull-down, damit der Eingang definiert ist.",achtung:"'Prellen': mechanischer Kontakt flattert kurz → entprellen (Kondensator oder Software).",bsp:"Taster mit internem Pull-up am Pico: gedrückt = LOW, die Software entprellt mit 20 ms.",tags:["Pull-up/down nötig","Prellen"]}},
{n:"Quarz / Oszillator",cat:"passiv",catL:"Passiv",fn:"Gibt einen sehr genauen Takt vor (Schwingung).",app:"Taktquelle für Mikrocontroller, Uhren, präzise Zeitmessung.",det:{kenn:"Frequenz (z. B. 16 MHz, 8 MHz, 32,768 kHz für Uhren).",kompat:"Quarz braucht zwei kleine Kondensatoren (Lastkapazität laut Datenblatt).",achtung:"Oszillator-Modul ist aktiv (3 Pins, braucht Strom), Quarz passiv (2 Pins).",bsp:"Der 16-MHz-Quarz taktet den ATmega328 auf dem Arduino; 32,768 kHz hält im RTC-Modul die Uhrzeit.",tags:["genauer Takt","Lastkondensatoren"]}},
{n:"Sicherung",cat:"schutz",catL:"Schutz",fn:"Unterbricht den Stromkreis bei zu hohem Strom (schmilzt durch).",app:"Schutz vor Überstrom/Kurzschluss, Brandschutz.",det:{kenn:"Nennstrom (A) und Charakteristik (flink/träge). Auch rückstellbar (PTC/Polyfuse).",kompat:"In die Plus-Leitung, vor die zu schützende Schaltung.",achtung:"Nennstrom knapp über Normalbetrieb wählen. Nie überbrücken.",bsp:"Eine 2-A-Polyfuse in der Plusleitung schützt das 12-V-Projekt — und stellt sich selbst zurück.",tags:["flink/träge","in Plus-Leitung"]}},
{n:"Sensor-Modul (allgemein)",cat:"modul",catL:"Modul",fn:"Fertige Platine, die eine Größe misst (Temp, Licht, Abstand, Bewegung).",app:"Eingangsdaten für Projekte: DHT22 (Temp/Feuchte), HC-SR04 (Abstand), PIR (Bewegung).",det:{kenn:"Schnittstelle: analog (Spannung), digital (an/aus), I²C oder SPI (Bus).",kompat:"Betriebsspannung prüfen (3,3 V vs 5 V) und Logikpegel zum Mikrocontroller.",achtung:"Bei 5 V-Sensor an 3,3 V-Controller (ESP32) Pegel anpassen.",bsp:"Ein HC-SR04 vorn am Roboter meldet: Hindernis in 20 cm → ausweichen.",tags:["3,3 V / 5 V prüfen","I²C / SPI / analog"]}},
{n:"Li-Ion / LiPo Akku",cat:"power",catL:"Stromquelle",fn:"Wiederaufladbarer Energiespeicher, hohe Energiedichte.",app:"Mobile Projekte, Wearables, alles ohne Steckdose.",det:{kenn:"Eine Zelle: 3,7 V nominal, 4,2 V voll, ~3,0 V leer. Kapazität in mAh.",kompat:"Laden NUR mit passendem Laderegler (z. B. TP4056 für 1 Zelle).",achtung:"Tiefentladung & Überladung gefährlich. Schutzschaltung (BMS) verwenden. Nicht beschädigen.",bsp:"Ein 1000-mAh-LiPo versorgt die mobile Wetterstation; TP4056 lädt, das BMS schützt vor Tiefentladung.",tags:["BMS/Schutz!","3,0-4,2 V","Spezial-Lader"]}},
/* ---- Boards ---- */
{n:"ESP32 DevKit (WROOM-32)",cat:"board",catL:"Board",fn:"Das klassische ESP32-Board: WLAN + Bluetooth, 2 Kerne.",app:"Standard für alles Vernetzte: smarte Sensoren, Heimautomatisierung.",det:{kenn:"240 MHz Dual-Core, WLAN 2,4 GHz, Bluetooth, ~25 frei nutzbare Pins (Rest input-only oder Strapping).",kompat:"3,3-V-Logik! Versorgung über USB oder 5-V-Pin (Regler an Bord).",achtung:"Pins vertragen keine 5 V. Beim Flashen manchmal BOOT-Taste halten. Braucht kräftige USB-Quelle.",bsp:"Herzstück einer Pflanzen-Bewässerung: liest die Bodenfeuchte, schaltet die Pumpe, App-Zugriff per WLAN.",tags:["3,3 V Pins","WLAN+BT","Standard"]}},
{n:"ESP32-S3 Board",cat:"board",catL:"Board",fn:"Stärkere ESP32-Variante mit mehr Speicher und KI-Beschleunigung.",app:"Anspruchsvolle Projekte: Displays, Kamera, Sprach-/Bilderkennung.",det:{kenn:"Dual-Core LX7, oft mit PSRAM, natives USB (kann Tastatur/Maus simulieren).",kompat:"3,3-V-Logik. Viele Varianten (N8R2, N16R8 = Flash/PSRAM-Größe).",achtung:"Beim Kauf auf Flash/PSRAM-Angabe achten, die Unterschiede sind groß.",bsp:"Treibt ein farbiges IPS-Display mit flüssiger Oberfläche und erkennt per Mikrofon einfache Sprachbefehle.",tags:["3,3 V Pins","PSRAM","natives USB"]}},
{n:"ESP32-C3 Super Mini",cat:"board",catL:"Board",fn:"Winziges, sehr günstiges ESP32-Board mit WLAN und Bluetooth.",app:"Kleine smarte Geräte, wo wenig Platz und Leistung reicht.",det:{kenn:"1 RISC-V-Kern, 160 MHz, daumennagelgroß, USB-C.",kompat:"3,3-V-Logik, weniger Pins (~11 nutzbar). Arduino/ESPHome-tauglich.",achtung:"Antenne winzig: WLAN-Reichweite schwächer als beim großen DevKit.",bsp:"Sitzt im Briefkasten und schickt eine Push-Nachricht, sobald die Klappe geöffnet wird.",tags:["3,3 V Pins","winzig","sehr günstig"]}},
{n:"ESP8266 D1 Mini",cat:"board",catL:"Board",fn:"Kompaktes, billiges WLAN-Board, der Vorgänger des ESP32.",app:"Einfache WLAN-Schalter und -Sensoren, Tasmota/ESPHome-Klassiker.",det:{kenn:"1 Kern 80/160 MHz, nur WLAN (kein Bluetooth), 1 Analogeingang.",kompat:"3,3-V-Logik. Shield-System mit stapelbaren Aufsteckplatinen.",achtung:"Wenige freie Pins, einige haben Sonderfunktionen beim Start.",bsp:"Mit Tasmota geflasht wird er zum WLAN-Schalter für die Kaffeemaschine.",tags:["3,3 V Pins","nur WLAN","billig"]}},
{n:"Arduino Nano",cat:"board",catL:"Board",fn:"Der kompakte Klassiker mit 5-V-Logik, steckbrettfreundlich.",app:"Lernen, einfache Steuerungen, Projekte mit 5-V-Sensorik.",det:{kenn:"ATmega328P, 16 MHz, 5-V-Logik, sehr robust.",kompat:"Verträgt 5-V-Signale direkt, ideal mit klassischem Zubehör.",achtung:"Kein Funk, wenig Speicher. Clones nutzen oft CH340-USB-Chip (Treiber nötig).",bsp:"Steuert eine Lichterkette mit Taster und drei Blinkmodi — robust und in einer Stunde aufgebaut.",tags:["5 V Logik","robust","Einsteiger"]}},
{n:"Raspberry Pi Pico 2 (W)",cat:"board",catL:"Board",fn:"Günstiges, sparsames Board, stark mit Python. W-Version mit Funk.",app:"Stromsparende Projekte, Python-Einstieg, präzise Signalsteuerung (PIO).",det:{kenn:"RP2350: 2 Kerne (ARM oder RISC-V), 520 KB RAM, 4 MB Flash.",kompat:"3,3-V-Logik. Programmieren als USB-Laufwerk (Datei rüberziehen).",achtung:"Nur 3 Analogeingänge. W-Variante nötig, wenn WLAN gebraucht wird.",bsp:"Datenlogger in MicroPython: schreibt alle 10 Sekunden die Temperatur auf die microSD-Karte.",tags:["3,3 V Pins","MicroPython","sparsam"]}},
{n:"ATtiny85 / Digispark",cat:"board",catL:"Board",fn:"Winziger Chip für Mini-Aufgaben mit wenigen Pins.",app:"Kleinstprojekte: ein Sensor, eine LED-Spielerei, USB-Gadget.",det:{kenn:"8-Bit, 8 KB Flash, 5-6 nutzbare Pins.",kompat:"Arduino-IDE-tauglich mit Zusatz-Board-Paket.",achtung:"Sehr begrenzt in Speicher und Pins, bewusst nur für Kleines.",bsp:"Simuliert in einer LED-Laterne das Flackern einer Kerze — ein Chip, eine LED, eine Batterie.",tags:["winzig","wenige Pins"]}},
/* ---- Spannungs- & Lademodule ---- */
{n:"Buck-Modul MP1584 (einstellbar)",cat:"modul",catL:"Modul",fn:"Kleiner Abwärtswandler: macht aus höherer eine niedrigere Spannung, per Poti einstellbar.",app:"12 V auf 5 V oder 3,3 V für Logik, effizienter Ersatz für Linearregler.",det:{kenn:"Eingang bis ~28 V, bis 3 A (mit Kühlung, dauerhaft eher 1,5-2 A).",kompat:"Ausgang VOR dem Anschließen mit Multimeter einstellen.",achtung:"Poti ist empfindlich, nach dem Einstellen mit Lack sichern. Bei Volllast Kühlung.",bsp:"Macht aus dem 12-V-Bleiakku des Solarprojekts stabile 5 V für den Controller.",tags:["vorher einstellen","Buck","bis ~3 A"]}},
{n:"Buck-Modul mit Festspannung (3,3/5/9/12 V)",cat:"modul",catL:"Modul",fn:"Abwärtswandler mit fester Ausgangsspannung, nichts einzustellen.",app:"Feste Versorgung, wenn kein Verstellen gewünscht ist (z. B. immer 5 V).",det:{kenn:"Typisch Eingang 5-30 V, Ausgang fest, bis ~3 A.",kompat:"Ausführung passend zur Zielspannung kaufen (steht auf dem Modul).",achtung:"Nichts falsch einzustellen, dafür unflexibel. Polung IN/OUT beachten.",bsp:"Das feste 5-V-Modul versorgt den WS2812-Streifen aus einem 12-V-Netzteil — nichts zu verstellen.",tags:["fest","narrensicher","Buck"]}},
{n:"Buck-Modul LM2596",cat:"modul",catL:"Modul",fn:"Größerer, robuster einstellbarer Abwärtswandler mit Poti.",app:"Kräftigere Lasten, Versorgung aus 12/24-V-Quellen.",det:{kenn:"Eingang bis ~35 V, nominell 3 A (real mit Kühlkörper).",kompat:"Groß genug für Schraubklemmen-Adapter, leicht zu handhaben.",achtung:"Viele Billig-Clones erreichen die 3 A nicht dauerhaft. Warm = Kühlkörper.",bsp:"Versorgt aus dem 24-V-Werkstattnetzteil einen 5-V-Verbraucher mit ~2 A dauerhaft (mit Kühlkörper).",tags:["robust","Poti","Buck"]}},
{n:"Boost-Modul MT3608",cat:"modul",catL:"Modul",fn:"Aufwärtswandler: macht aus niedriger eine höhere Spannung (z. B. Akku auf 5 V).",app:"Akku-Projekte: 3,7 V auf 5 V oder 9/12 V hochsetzen.",det:{kenn:"Eingang 2-24 V, Ausgang bis 28 V, max. 2 A (eher weniger bei großem Hub).",kompat:"Per Poti einstellen. Ausgang immer HÖHER als Eingang.",achtung:"Kann keine Spannung senken. Je größer der Hub, desto weniger Strom verfügbar.",bsp:"Hebt die 3,7 V einer 18650-Zelle auf 5 V für ein USB-Gadget an.",tags:["Boost","vorher einstellen","Akku auf 5 V"]}},
{n:"Laderegler TP4056 (USB-C)",cat:"modul",catL:"Modul",fn:"Lädt eine einzelne Li-Ion/LiPo-Zelle sicher über USB.",app:"Alles Akku-Betriebene: 18650 oder LiPo laden, oft mit Schutzschaltung an Bord.",det:{kenn:"Lädt auf 4,2 V, Standard-Ladestrom 1 A (über Widerstand änderbar).",kompat:"Version MIT Schutz (6 Beinchen-Chip zusätzlich) nehmen: schützt vor Tiefentladung.",achtung:"Nur für 1 Zelle! Laden und gleichzeitig Last dran ist nur eingeschränkt sauber.",bsp:"Lädt die 18650-Zelle der selbstgebauten Powerbank sicher über USB-C.",tags:["1 Zelle","mit Schutz kaufen","4,2 V"]}},
{n:"Pegelwandler (Level Shifter)",cat:"modul",catL:"Modul",fn:"Übersetzt Signale zwischen 3,3-V- und 5-V-Welt in beide Richtungen.",app:"5-V-Sensor an ESP32/Pico, I²C zwischen verschiedenen Pegeln.",det:{kenn:"Meist 4 oder 8 Kanäle, bidirektional (beide Richtungen).",kompat:"Beide Seiten brauchen ihre Versorgung (LV = 3,3 V, HV = 5 V) plus Masse.",achtung:"Für schnelle Signale (z. B. WS2812) besser spezielle Treiberchips.",bsp:"Übersetzt das 5-V-I²C eines älteren Sensors auf die 3,3 V des ESP32 — in beide Richtungen.",tags:["3,3↔5 V","bidirektional"]}},
{n:"Relais-Modul",cat:"modul",catL:"Modul",fn:"Fertiges Relais mit Treiber, Freilaufdiode und oft Optokoppler an Bord.",app:"Lasten sicher per Mikrocontroller schalten, ohne eigene Treiberschaltung.",det:{kenn:"1-8 Kanäle, Spule 5 V oder 3,3 V, Kontakte oft 10 A / 250 V.",kompat:"Auf Auslöselogik achten: viele Module schalten bei LOW (active low).",achtung:"Für Netzspannung nur mit Erfahrung und sauberem Aufbau (Abstände, Gehäuse).",bsp:"Ein 4-Kanal-Modul schaltet vier Ventile der Gartenbewässerung, gesteuert vom ESP32.",tags:["Treiber dabei","active low häufig"]}},
{n:"RTC-Modul DS3231",cat:"modul",catL:"Modul",fn:"Präzise Echtzeituhr mit eigener Pufferbatterie: kennt Uhrzeit auch stromlos.",app:"Uhren, Datenlogger mit Zeitstempel, zeitgesteuerte Abläufe.",det:{kenn:"Sehr ganggenau (temperaturkompensiert), I²C-Anschluss.",kompat:"Knopfzelle als Puffer. Bibliotheken für alle gängigen Boards.",achtung:"Bei Modulen mit Lade-Schaltung: normale CR2032 NICHT laden (Lade-Widerstand entfernen oder LIR2032 nutzen).",bsp:"Weckt den stromsparenden Datenlogger zu jeder vollen Stunde — auch nach Stromausfall stimmt die Zeit.",tags:["I²C","Knopfzellen-Puffer"]}},
{n:"microSD-Karten-Modul",cat:"modul",catL:"Modul",fn:"Kartenleser zum Speichern von Daten auf microSD.",app:"Datenlogger, Einstellungen speichern, Audio-Dateien abspielen.",det:{kenn:"SPI-Anschluss. Karten bis 32 GB (FAT32) sind am unkompliziertesten.",kompat:"3,3-V- und 5-V-Varianten (mit Regler/Pegelwandler an Bord) beachten.",achtung:"Karte sauber formatieren. Beim Schreiben Spannungsspitzen: Stützkondensator hilft.",bsp:"Speichert die Messwerte der Wetterstation als CSV-Datei zum späteren Auswerten am PC.",tags:["SPI","FAT32"]}},
{n:"WS2812-LEDs (Neopixel)",cat:"modul",catL:"Modul",fn:"RGB-LEDs mit eingebautem Chip: jede LED einzeln farbsteuerbar über eine Datenleitung.",app:"Lichteffekte, Statusanzeigen, Matrizen, Ambilight.",det:{kenn:"5 V, eine Datenleitung, ~60 mA pro LED bei voll Weiß.",kompat:"Datenleitung mit ~330-Ω-Widerstand, dicker Elko an der Versorgung.",achtung:"Strom summiert sich schnell: 60 LEDs voll Weiß sind schon 3,6 A! Netzteil danach wählen.",bsp:"Ein 60er-LED-Ring als Wanduhr: jede LED eine Minute, gesteuert über eine einzige Datenleitung.",tags:["5 V","Strom summiert sich!","1 Datenleitung"]}},
/* ---- Display-Module ---- */
{n:"OLED-Modul 0,96\" (SSD1306)",cat:"modul",catL:"Modul",fn:"Kleines, gestochen scharfes Display, jedes Pixel leuchtet selbst.",app:"Messwerte, Status, kleine Menüs. Details im Tab <a href='#displays'>Displays</a>.",det:{kenn:"128x64 Pixel, einfarbig, I²C (nur 2 Datenleitungen).",kompat:"3,3 und 5 V tauglich. Bibliotheken: U8g2, Adafruit SSD1306.",achtung:"Bei Dauerbetrieb kann sich ein Standbild leicht einbrennen.",bsp:"Zeigt Temperatur und Luftfeuchte der Wetterstation gestochen scharf an — über nur zwei Leitungen.",tags:["I²C","stromsparend"]}},
{n:"E-Paper-Modul (Waveshare/WeAct)",cat:"modul",catL:"Modul",fn:"Elektronisches Papier: hält das Bild ohne Strom, top bei Tageslicht.",app:"Wetterstation, Kalender, Etiketten, Batterie-/Solarprojekte.",det:{kenn:"Gängig 1,54\" bis 7,5\", schwarz/weiß, teils mit Rot/Gelb. SPI.",kompat:"Waveshare und WeAct liefern Bibliotheken und Beispielcode.",achtung:"Bildwechsel dauert Sekunden und flackert dabei, das ist normal. Nicht zu oft hintereinander aktualisieren.",bsp:"Ein Kalender-Display, das sein Bild behält, auch wenn der Akku monatelang schläft.",tags:["SPI","0 Strom im Halten","langsam"]}},
{n:"TFT/IPS-Modul (ST7789)",cat:"modul",catL:"Modul",fn:"Farbdisplay mit kräftigen Farben und guten Blickwinkeln.",app:"Bunte Anzeigen, Diagramme, kleine Oberflächen.",det:{kenn:"Gängig 1,3\" bis 2,4\", z. B. 240x240 Pixel, SPI.",kompat:"3,3-V-Logik. Bibliothek TFT_eSPI (ESP32) sehr verbreitet.",achtung:"Hintergrundbeleuchtung zieht dauerhaft Strom, nichts für Batterie-Dauerbetrieb.",bsp:"Zeigt am 3D-Drucker-Umbau die Temperaturkurve von Düse und Bett in Farbe.",tags:["SPI","IPS = gute Winkel"]}},
{n:"LCD1602 mit I²C-Adapter",cat:"modul",catL:"Modul",fn:"Der Klassiker für 2 Zeilen Text, mit I²C-Rucksack kinderleicht.",app:"Einfache Textausgaben, Retro-Projekte, Statusanzeigen.",det:{kenn:"16 Zeichen x 2 Zeilen, I²C über den aufgelöteten Adapter.",kompat:"Meist 5 V. Kontrast über Poti auf dem Adapter einstellen.",achtung:"Zeigt nichts an? Fast immer nur der Kontrast falsch eingestellt.",bsp:"Zeigt im Retro-Look zwei Zeilen: „Temp: 21.5 C“ und „Feuchte: 45 %“.",tags:["I²C","5 V","nur Text"]}},
{n:"7-Segment-Modul TM1637",cat:"modul",catL:"Modul",fn:"Vier große Ziffern wie bei einer Digitaluhr, mit 2 Leitungen steuerbar.",app:"Uhren, Zähler, Temperaturanzeige auf Distanz.",det:{kenn:"4 Ziffern mit Doppelpunkt, Helligkeit regelbar.",kompat:"3,3 und 5 V tauglich, einfache Bibliotheken.",achtung:"Nur Zahlen und wenige Buchstaben darstellbar.",bsp:"Große rote Ziffern als Küchen-Countdown — aus drei Metern ablesbar.",tags:["2 Leitungen","gut ablesbar"]}},
/* ---- Sensorik ---- */
{n:"LDR (Fotowiderstand)",cat:"sensor",catL:"Sensorik",fn:"Widerstand, der bei Licht kleiner wird: das einfachste Lichtmessgerät.",app:"Dämmerungsschalter, Helligkeit messen, Lichtschranken-Basteleien.",det:{kenn:"Typ 5528 & Co.: hell wenige kΩ, dunkel bis MΩ.",kompat:"Mit Festwiderstand als Spannungsteiler an einen Analogeingang.",achtung:"Träge und ungenau, für präzise Messung Fotodiode/BH1750 nehmen.",bsp:"Mit 10-kΩ-Festwiderstand als Spannungsteiler: Dämmerung erkannt → Gartenlicht an.",tags:["analog","Spannungsteiler","träge"]}},
{n:"NTC-Thermistor",cat:"sensor",catL:"Sensorik",fn:"Widerstand, der bei Wärme kleiner wird: einfacher Temperaturfühler.",app:"Temperatur grob messen, Übertemperatur erkennen (auch in 3D-Drucker-Hotends!).",det:{kenn:"Gängig 10 kΩ bei 25 °C (NTC 3950).",kompat:"Als Spannungsteiler an Analogeingang, Umrechnung per Formel/Tabelle.",achtung:"Kennlinie ist krumm, für genaue Werte Kalibrierung oder DS18B20 nutzen.",bsp:"Ein 10-kΩ-NTC am Analogeingang überwacht, ob der Kühlkörper des Netzteils zu heiß wird.",tags:["analog","10k Standard"]}},
{n:"DS18B20 (Temperatur, digital)",cat:"sensor",catL:"Sensorik",fn:"Digitaler Temperaturfühler, auch als wasserdichte Kabelversion.",app:"Genaue Temperatur in Luft oder Flüssigkeit, mehrere Fühler an einer Leitung.",det:{kenn:"±0,5 °C, Bereich -55 bis +125 °C, 1-Wire-Bus.",kompat:"Braucht 4,7-kΩ-Pull-up auf der Datenleitung. Viele Fühler parallel möglich.",achtung:"Billig-Fakes verbreitet, die bei Hitze falsch messen. Bei Markenhändler kaufen.",bsp:"Die wasserdichte Version misst die Aquarium-Temperatur; 4,7-kΩ-Pull-up an 3,3 V.",tags:["1-Wire","Pull-up 4,7k","wasserdicht erhältlich"]}},
{n:"DHT22 / AM2302 (Temp+Feuchte)",cat:"sensor",catL:"Sensorik",fn:"Misst Temperatur und Luftfeuchtigkeit in einem Gehäuse.",app:"Wetterstation, Raumklima, Gewächshaus.",det:{kenn:"±0,5 °C, ±2-5 % Feuchte, eigenes 1-Draht-Protokoll.",kompat:"Pull-up auf Datenleitung, fertige Bibliotheken überall.",achtung:"Langsam (alle 2 s ein Wert). Moderner Ersatz: SHT31/BME280.",bsp:"Misst Temperatur und Feuchte im Gewächshaus; der ESP schickt alle zwei Minuten die Werte.",tags:["träge","Pull-up"]}},
{n:"BME280 (Temp+Feuchte+Druck)",cat:"sensor",catL:"Sensorik",fn:"Präziser 3-in-1-Umweltsensor inklusive Luftdruck.",app:"Wetterstation deluxe, Höhenmessung, Raumklima.",det:{kenn:"I²C (oder SPI), sehr genau und schnell.",kompat:"3,3-V-Module überall erhältlich, top Bibliotheken.",achtung:"Verwechslungsgefahr: BMP280 (ohne Feuchte!) sieht fast gleich aus.",bsp:"Liefert der Wetterstation Temperatur, Feuchte und Luftdruck über I²C — der Drucktrend verrät das Wetter von morgen.",tags:["I²C","BMP≠BME!"]}},
{n:"HC-SR04 (Ultraschall-Abstand)",cat:"sensor",catL:"Sensorik",fn:"Misst Entfernung per Schall-Echo, wie eine Fledermaus.",app:"Abstandswarner, Füllstand, Roboter-Hinderniserkennung.",det:{kenn:"~2-400 cm, Trigger/Echo-Pins, 5 V.",kompat:"An 3,3-V-Boards das Echo-Signal über Spannungsteiler führen.",achtung:"Weiche/schräge Flächen schlucken das Echo, Messung wird unzuverlässig.",bsp:"Misst den Füllstand der Regentonne: Abstand zur Wasseroberfläche = Restmenge.",tags:["5 V","Echo-Pegel wandeln"]}},
{n:"PIR-Bewegungsmelder (HC-SR501)",cat:"sensor",catL:"Sensorik",fn:"Erkennt Bewegung von Wärmequellen (Menschen, Tiere).",app:"Licht bei Bewegung, Alarmanlagen, Anwesenheitserkennung.",det:{kenn:"Reichweite/Haltezeit per Potis einstellbar, Ausgang digital HIGH.",kompat:"Läuft ab 5 V (intern 3,3 V), Ausgang direkt lesbar.",achtung:"Braucht nach dem Einschalten ~1 Minute Aufwärmzeit. Zugluft/Wärmequellen lösen Fehlalarme aus.",bsp:"Schaltet das Kellerlicht bei Bewegung für zwei Minuten ein — die Haltezeit stellt man am Poti ein.",tags:["digital","Aufwärmzeit"]}},
{n:"MPU6050 (Beschleunigung+Gyro)",cat:"sensor",catL:"Sensorik",fn:"Spürt Neigung, Bewegung und Drehung, der Lagesensor.",app:"Selbstbalancierendes, Gestensteuerung, Vibration messen, Drohnen.",det:{kenn:"6 Achsen (3x Beschleunigung, 3x Drehrate), I²C.",kompat:"Fertige Bibliotheken mit Lageberechnung vorhanden.",achtung:"Rohwerte driften, für stabile Winkel Filter/Bibliothek nutzen.",bsp:"Hält den selbstbalancierenden Zwei-Rad-Roboter aufrecht — hundert Lagewerte pro Sekunde.",tags:["I²C","6 Achsen"]}},
{n:"Hall-Sensor / Reed-Kontakt",cat:"sensor",catL:"Sensorik",fn:"Erkennt Magnete: Hall elektronisch, Reed als Magnetschalter.",app:"Tür/Fenster-Kontakt, Drehzahl messen, Endlagen-Erkennung.",det:{kenn:"Reed = mechanischer Kontakt (potentialfrei = wie ein simpler Schalter, ohne eigene Versorgung), Hall = Chip (z. B. A3144).",kompat:"Reed wie einen Taster behandeln, Hall braucht Versorgung + Pull-up.",achtung:"Reed-Röhrchen sind aus Glas: nicht knicken, vorsichtig biegen.",bsp:"Reed-Kontakt und Magnet am Fensterrahmen melden der Alarmanlage „Fenster offen“.",tags:["Magnet","Reed = Glas!"]}},
{n:"Drehencoder KY-040",cat:"sensor",catL:"Sensorik",fn:"Endlos drehbarer Knopf, der Drehschritte und Richtung meldet, mit Drucktaster.",app:"Menüs bedienen, Werte einstellen, Lautstärkeknopf.",det:{kenn:"2 versetzte Signale (A/B) verraten die Richtung, plus Taster.",kompat:"3 Eingänge am Board, Bibliotheken erledigen die Auswertung.",achtung:"Prellt stark: ohne Entprellung (Software/Kondensator) springen Werte.",bsp:"Der Menü-Knopf am 3D-Drucker: Drehen wählt den Eintrag, Drücken bestätigt.",tags:["Prellen!","endlos drehbar"]}},
{n:"Joystick-Modul (2 Achsen)",cat:"sensor",catL:"Sensorik",fn:"Daumen-Joystick wie am Gamepad: zwei Potis plus Druck-Taster.",app:"Roboter fernsteuern, Kamera schwenken, Menünavigation.",det:{kenn:"X/Y analog (2 Analogeingänge nötig), Taster digital.",kompat:"An 3,3-V-Boards Werte-Skala beachten (Mittelstellung ≈ halber Messbereich).",achtung:"Mittelstellung streut, im Code eine Totzone einbauen.",bsp:"Steuert den Kamera-Schwenkkopf: Die X/Y-Werte werden direkt zu Servo-Winkeln.",tags:["2x analog","Totzone einplanen"]}},
{n:"Buzzer (aktiv/passiv)",cat:"sensor",catL:"Sensorik",fn:"Kleiner Tongeber für Pieptöne und einfache Melodien.",app:"Alarm, Tastenklick, Melodie, Statuston.",det:{kenn:"Aktiv: piept bei Gleichspannung von selbst. Passiv: braucht Tonsignal (PWM), kann Melodien.",kompat:"Größere Typen über Transistor schalten, kleine oft direkt am Pin ok.",achtung:"Aktiv und passiv sehen gleich aus! Test: an Batterie piept nur der aktive.",bsp:"Der passive Buzzer spielt eine Alarm-Melodie, wenn der Wassermelder unter der Spülmaschine anschlägt.",tags:["aktiv≠passiv","PWM für Melodie"]}},
/* ---- Stromquellen & Batteriearten ---- */
{n:"18650-Zelle + Halter",cat:"power",catL:"Stromquelle",fn:"Die Standard-Rundzelle unter den Li-Ion-Akkus, wechselbar im Halter.",app:"Powerbanks, Lampen, mobile Projekte mit ordentlich Kapazität.",det:{kenn:"3,7 V nominal, real 1800-3500 mAh. Halter für 1-4 Zellen.",kompat:"Laden über TP4056, geschützte und ungeschützte Zellen beachten (Länge!).",achtung:"Fantasie-Angaben wie 9800 mAh sind Fake. Markenzellen (Samsung, LG, Sanyo) kaufen.",bsp:"Zwei Zellen im Halter versorgen die Roboter-Plattform — leer? In Sekunden gewechselt.",tags:["3,7 V","Fake-mAh meiden","TP4056"]}},
{n:"LiFePO4-Zelle",cat:"power",catL:"Stromquelle",fn:"Die sichere, langlebige Schwester des Li-Ion mit 3,2 V.",app:"Solar-/Dauerprojekte, wo Sicherheit und viele Ladezyklen zählen.",det:{kenn:"3,2 V nominal, 3,65 V voll. Tausende Ladezyklen, sehr temperaturstabil.",kompat:"Braucht EIGENE Laderegler mit 3,65 V Ladeschluss — ein normaler Li-Ion-Lader (4,2 V) würde die Zelle überladen.",achtung:"Nicht mit TP4056-Standard laden (falsche Ladeschlussspannung).",bsp:"Ideal fürs Solar-Gartenlicht: übersteht tausende Ladezyklen und heiße Sommer im Freien.",tags:["3,2 V","sehr sicher","eigener Lader"]}},
{n:"Knopfzelle CR2032",cat:"power",catL:"Stromquelle",fn:"Flache 3-V-Zelle für Winzig-Verbraucher und Pufferung.",app:"RTC-Puffer, Fernbedienungen, kleine Sensoren.",det:{kenn:"3 V, ~220 mAh, NICHT wiederaufladbar.",kompat:"Wiederaufladbares Pendant heißt LIR2032 (3,6 V).",achtung:"Für Kinder extrem gefährlich beim Verschlucken, sicher lagern!",bsp:"Puffert im DS3231-RTC-Modul jahrelang die Uhrzeit.",tags:["3 V","nicht ladbar","Kindergefahr"]}},
{n:"AA/AAA & 9-V-Block",cat:"power",catL:"Stromquelle",fn:"Die klassischen Haushaltsbatterien und ihre Akku-Versionen.",app:"Einfache Geräte, Fernbedienungen, Erstversorgung von Projekten.",det:{kenn:"Alkaline-Zelle 1,5 V, NiMH-Akku 1,2 V. 9-V-Block hat wenig Kapazität.",kompat:"3x AA (4,5 V) oder 4x NiMH (4,8 V) sind brauchbare 5-V-nahe Quellen.",achtung:"Leere Alkaline laufen gern aus: aus Geräten nehmen bei Nichtgebrauch.",bsp:"Ein 4x-NiMH-Pack (4,8 V) treibt den Arduino-Roboter an; der 9-V-Block steckt im Multimeter.",tags:["1,5/1,2 V","auslaufgefahr"]}},
{n:"Solarzelle (klein)",cat:"power",catL:"Stromquelle",fn:"Wandelt Licht in Strom, für autarke Kleinprojekte.",app:"Garten-Sensor, E-Paper-Anzeige, Akku nachladen.",det:{kenn:"Gängig 5 V oder 6 V mit 1-3 W. Leistung stark lichtabhängig.",kompat:"Mit Laderegler + Akku als Puffer kombinieren, nie direkt an die Schaltung.",achtung:"Im Innenraum kommt fast nichts an. Angaben gelten für pralle Sonne.",bsp:"Ein 6-V/2-W-Panel lädt über einen Laderegler den Akku des Garten-Feuchtesensors nach.",tags:["+Laderegler","+Akku-Puffer"]}},
/* ---- Kabel & Verbinder ---- */
{n:"Jumper-Kabel (Dupont)",cat:"kabel",catL:"Kabel/Verbinder",fn:"Die Standard-Steckkabel fürs Steckbrett in drei Sorten.",app:"Prototypen verdrahten: Board zu Breadboard zu Modul.",det:{kenn:"Stecker-Stecker, Stecker-Buchse, Buchse-Buchse, meist 10-30 cm.",kompat:"Passen auf 2,54-mm-Stiftleisten (der Standard überall).",achtung:"Billige haben dünne Adern und Wackelkontakte, erste Fehlerquelle beim Debuggen.",bsp:"Verbinden beim Prototyp der Wetterstation Steckbrett, Sensor und ESP32 in Sekunden.",tags:["3 Sorten","2,54 mm"]}},
{n:"Schaltlitze / Silikonlitze",cat:"kabel",catL:"Kabel/Verbinder",fn:"Flexible Einzeladern zum Selbstkonfektionieren, Silikon bleibt auch bei Hitze weich.",app:"Feste Verdrahtung, Lötverbindungen, bewegte Kabel.",det:{kenn:"Größe in AWG: 22 AWG fürs Steckbrett-Umfeld, 18 AWG für mehr Strom.",kompat:"Kleinere AWG-Zahl = dickerer Draht = mehr Strom erlaubt.",achtung:"Zu dünner Draht für viel Strom wird heiß (siehe Tab <a href='#sicherheit'>Sicherheit</a>).",bsp:"22-AWG-Silikonlitze verdrahtet die Lochrasterplatine; 18 AWG führt die 2 A zum Motor.",tags:["AWG-Logik","Silikon = hitzefest"]}},
{n:"Stiftleisten (Pin Header)",cat:"kabel",catL:"Kabel/Verbinder",fn:"Die Steckkontakte im 2,54-mm-Raster, männlich und weiblich, zum Auflöten.",app:"Boards steckbar machen, Module verbinden, eigene Adapter.",det:{kenn:"Abbrechbar auf beliebige Länge, gerade oder gewinkelt.",kompat:"Passt zu Dupont-Kabeln, Breadboards und Lochraster.",achtung:"Beim Einlöten zuerst nur einen Pin heften und Ausrichtung prüfen.",bsp:"Auf das ESP32-Board gelötet machen sie es steckbar fürs Steckbrett — nichts wird fest verlötet.",tags:["2,54 mm","abbrechbar"]}},
{n:"JST-Steckverbinder",cat:"kabel",catL:"Kabel/Verbinder",fn:"Kleine verpolungssichere Steckerfamilie, Standard bei Akkus und Modulen.",app:"Akku-Anschlüsse (LiPo!), lösbare Verbindungen zwischen Baugruppen.",det:{kenn:"Familien: PH (2,0 mm, LiPo-Standard), XH (2,5 mm), SH (1,0 mm, winzig).",kompat:"Familie und Rastermaß müssen exakt passen, die Namen ähneln sich.",achtung:"Bei fertigen Akku-Kabeln Polung prüfen: Rot ist NICHT immer Plus!",bsp:"Ein JST-PH-Stecker verbindet den LiPo verpolungssicher mit dem Laderegler.",tags:["PH/XH/SH","Polung prüfen!"]}},
{n:"Schraubklemmen",cat:"kabel",catL:"Kabel/Verbinder",fn:"Kabel festschrauben statt löten, jederzeit wieder lösbar.",app:"Netzteil-Anschlüsse, dickere Drähte, wechselnde Verkabelung.",det:{kenn:"Rastermaß 5,08 oder 3,5 mm für Platinen, plus Reihen-/Hebelklemmen (Wago-Stil).",kompat:"Für Litze Aderendhülsen verwenden, dann sitzt es sauber.",achtung:"Regelmäßig nachziehen bei Vibration, lose Klemme = Wärmestelle.",bsp:"Das Netzteilkabel wird an der Platine festgeschraubt statt gelötet — beim Umbau einfach lösen.",tags:["lösbar","Aderendhülsen"]}},
{n:"Krokodilklemmen",cat:"kabel",catL:"Kabel/Verbinder",fn:"Schnelle Klemmverbindung ohne Löten, ideal zum Messen und Testen.",app:"Provisorien, Messgerät anklemmen, Bauteil kurz kontaktieren.",det:{kenn:"Auch als Kroko-zu-Dupont-Mischkabel sehr praktisch.",kompat:"Passt an fast alles, was Metall zeigt.",achtung:"Rutschen leicht ab und schließen dann Nachbarn kurz: Blick drauf behalten.",bsp:"Klemmen das Multimeter für eine Langzeitmessung an die Akku-Pole — die Hände bleiben frei.",tags:["Provisorium","Abrutsch-Gefahr"]}},
{n:"USB-Kabel & USB-Breakouts",cat:"kabel",catL:"Kabel/Verbinder",fn:"Strom- und Datenzufuhr; Breakout-Platinen führen USB-Pins zum Anzapfen heraus.",app:"Boards flashen, 5 V abgreifen, USB-C-Buchse in eigene Projekte einbauen.",det:{kenn:"USB liefert 5 V; USB-C-Breakouts brauchen 2 Widerstände (5,1 kΩ), um 5 V vom Netzteil zu bekommen.",kompat:"Für Datenverbindung echte Datenkabel nutzen, es gibt reine Ladekabel!",achtung:"Board wird nicht erkannt? Sehr oft ist nur das Kabel ein Ladekabel ohne Datenadern.",bsp:"Ein USB-C-Breakout mit den zwei 5,1-kΩ-Widerständen holt 5 V aus jedem USB-C-Netzteil.",tags:["Ladekabel-Falle","5,1k bei USB-C"]}},
/* ---- Verbrauchsmaterial ---- */
{n:"Lötzinn",cat:"verbrauch",catL:"Verbrauch",fn:"Das Metall, das die Verbindung herstellt, mit Flussmittel-Seele im Kern.",app:"Jede Lötarbeit. Details im Artefakt <a href='loeten-referenz.html'>Löten-Referenz</a>.",det:{kenn:"Bleihaltig (Sn60Pb40) fließt leichter, bleifrei (SAC305) ist Standard neu. 0,8 mm Allround.",kompat:"Alle Temperaturen und Legierungen: <a href='loeten-referenz.html#temp'>Löten-Referenz → Temperaturen</a>.",achtung:"Nach dem Löten Hände waschen (bleihaltig), gut lüften.",bsp:"0,8-mm-Lot mit Flussmittelseele verlötet die Stiftleisten am neuen ESP32-Board.",tags:["0,8 mm Allround","Hände waschen"]}},
{n:"Flussmittel (Flux)",cat:"verbrauch",catL:"Verbrauch",fn:"Entfernt Oxid und lässt Lot sauber fließen, das Geheimnis schöner Lötstellen.",app:"SMD-Löten, Entlöten, nachbessern alter Lötstellen. Als Stift, Spritze oder Paste.",det:{kenn:"No-Clean-Flux (z. B. Stift 951) muss nicht entfernt werden.",kompat:"Ergänzt die Flussmittel-Seele im Lötzinn, ersetzt sie bei Rework.",achtung:"Aggressive Sorten (Lötwasser/Lötfett für Klempner) NIE auf Elektronik!",bsp:"Ein Strich mit dem Flux-Pen über die TSSOP-Pins vor dem Drag-Soldering — keine Brücken.",tags:["No-Clean","kein Lötfett!"]}},
{n:"Entlötlitze",cat:"verbrauch",catL:"Verbrauch",fn:"Kupfergeflecht, das flüssiges Lot aufsaugt wie ein Docht.",app:"Bauteile auslöten, Lötbrücken entfernen, Pads säubern.",det:{kenn:"2,0-2,5 mm Breite ist der Allrounder.",kompat:"Mit etwas Flux auf der Litze saugt sie deutlich besser.",achtung:"Wird beim Arbeiten heiß bis zur Fingerspitze: nachfassen, nicht festhalten.",bsp:"Zieht die versehentliche Lötbrücke zwischen zwei IC-Pins sauber ab.",tags:["+Flux = besser","wird heiß"]}},
{n:"Kapton-Band (Polyimid)",cat:"verbrauch",catL:"Verbrauch",fn:"Hauchdünnes, hitzefestes Klebeband, das Löttemperaturen übersteht.",app:"Bauteile beim Löten/Heißluft abdecken, Isolieren, 3D-Druck-Betten.",det:{kenn:"Hält ~260 °C aus, elektrisch isolierend, rückstandsfrei ablösbar.",kompat:"Der Standard beim Schutz von Nachbar-Bauteilen bei Heißluft-Arbeiten.",achtung:"Billige Fälschungen schrumpeln bei Hitze, auf Polyimid achten.",bsp:"Deckt beim Heißluft-Entlöten die Steckverbinder daneben ab, damit nichts mitschmilzt.",tags:["~260 °C","isolierend"]}},
{n:"Schrumpfschlauch",cat:"verbrauch",catL:"Verbrauch",fn:"Schlauch, der sich bei Wärme festzieht und Lötstellen isoliert.",app:"Kabelverbindungen isolieren, Zugentlastung, Kabel bündeln.",det:{kenn:"Schrumpfrate meist 2:1. Sortimentsbox mit mehreren Durchmessern lohnt.",kompat:"Mit Heißluft oder vorsichtig Feuerzeug (Abstand!) schrumpfen.",achtung:"VOR dem Verlöten aufs Kabel schieben, der Klassiker unter den vergessenen Schritten.",bsp:"Isoliert die verlötete Kabelverbindung zum Motor — vorher aufschieben!",tags:["vorher aufschieben!","2:1"]}},
{n:"Heißkleber",cat:"verbrauch",catL:"Verbrauch",fn:"Schnelle mechanische Fixierung und Zugentlastung, elektrisch isolierend.",app:"Kabel fixieren, Module im Gehäuse befestigen, Provisorien.",det:{kenn:"Niedertemperatur-Sticks schonen empfindliche Teile.",kompat:"Haftet auf den meisten Kunststoffen, lässt sich mit Isopropanol wieder lösen.",achtung:"Keine tragende Verbindung und nichts für heiße Stellen (erweicht wieder).",bsp:"Fixiert das ESP32-Board und die Kabel im 3D-gedruckten Gehäuse.",tags:["Zugentlastung","nicht hitzefest"]}},
{n:"Isopropanol (IPA)",cat:"verbrauch",catL:"Verbrauch",fn:"Der Reinigungsalkohol der Elektronik: löst Flussmittelreste rückstandsfrei.",app:"Platinen nach dem Löten reinigen, Kontakte säubern, Kleberreste entfernen.",det:{kenn:"99,9 % nehmen, verdunstet rückstandsfrei. Mit Wattestäbchen oder ESD-Pinsel.",kompat:"Sicher für fast alle Platinen und Gehäuse-Kunststoffe.",achtung:"Leicht entzündlich, weg von Funken und offener Flamme. Gut lüften.",bsp:"Entfernt nach dem Löten die Flussmittelreste — die Platine sieht aus wie neu.",tags:["99,9 %","entzündlich"]}},
/* ---- Mechanik-Ergänzung ---- */
{n:"Mini-Breadboard (170 Kontakte)",cat:"mech",catL:"Elektromech.",fn:"Winziges Steckbrett für kleine Schaltungen, oft zusammensteckbar.",app:"Ein Sensor plus Board schnell testen, dauerhaft im Projektgehäuse.",det:{kenn:"170 Kontakte, meist ohne Versorgungsschienen, klebbare Rückseite.",kompat:"Gleiche 5er-Gruppen-Logik wie das große Steckbrett (Tab <a href='#praxis'>Praxis & Aufbau</a>).",achtung:"Keine Randschienen: Plus/Minus selbst als Spalten definieren.",bsp:"Ein Sensor plus ESP32-C3 als Mini-Aufbau, direkt ins Projektgehäuse geklebt.",tags:["ohne Schienen","klebbar"]}},
{n:"Lochrasterplatine",cat:"mech",catL:"Elektromech.",fn:"Platine mit Lötpunkten im 2,54-mm-Raster für den dauerhaften Aufbau.",app:"Getestete Steckbrett-Schaltungen fest verlöten. Details im Tab <a href='#praxis'>Praxis & Aufbau</a>.",det:{kenn:"Punktraster (einzelne Pads) oder Streifenraster (verbundene Reihen).",kompat:"Passt zu allen bedrahteten Bauteilen und Stiftleisten.",achtung:"Beim Streifenraster Trennstellen nicht vergessen (aufbohren).",bsp:"Die auf dem Steckbrett getestete Wetterstations-Schaltung wird hier dauerhaft verlötet.",tags:["2,54 mm","Punkt/Streifen"]}},
];
const CDESC={
"Widerstand":"Eine Engstelle für den Strom. Je größer der Wert, desto weniger Strom kommt bei gleicher Spannung durch. Das einfachste und häufigste Bauteil überhaupt.",
"Potentiometer":"Ein Widerstand mit Drehknopf: durch Drehen änderst du den Wert stufenlos, wie bei einem Lautstärke- oder Dimmer-Regler.",
"Keramik-Kondensator":"Ein winziger, blitzschneller Ladungsspeicher. Sitzt neben fast jedem Chip und bügelt kurze Spannungsstörungen glatt.",
"Elektrolyt-Kondensator (Elko)":"Ein größerer Ladungsspeicher als Puffer: fängt Spannungsschwankungen ab wie ein Wassertank den Druck. Muss richtig herum eingebaut werden.",
"Folien-Kondensator":"Ein besonders stabiler, langlebiger Ladungsspeicher mittlerer Größe. Beliebt in Audio und Filtern, wo es auf Genauigkeit ankommt.",
"Spule / Induktivität":"Ein aufgewickelter Draht, der sich gegen schnelle Stromänderungen wehrt und Energie magnetisch zwischenspeichert. Das Gegenstück zum Kondensator.",
"Diode (z. B. 1N4007)":"Ein Einbahnschild für Strom: lässt ihn nur in eine Richtung durch. Schützt zum Beispiel davor, dass Strom falsch herum fließt.",
"Schottky-Diode":"Eine Diode mit fast keinem Spannungsverlust, die zudem sehr schnell schaltet. Überall dort, wo wenig verschenkt werden darf.",
"Zener-Diode":"Eine Diode, die ab einer festen Spannung die Tür öffnet und so eine Spannung auf einen genauen Wert begrenzt.",
"LED":"Eine Diode, die leuchtet, sobald Strom durchfließt. Braucht immer einen Vorwiderstand, sonst brennt sie durch.",
"Bipolar-Transistor (NPN/PNP)":"Ein winziger Schalter, bei dem ein kleiner Strom einen großen Strom steuert. Klassiker für Signalverstärkung und einfache Schaltstufen.",
"MOSFET":"Ein elektronischer Schalter, den eine Spannung steuert. Schaltet kräftige Lasten wie Motoren oder LED-Streifen fast ohne eigene Wärme, ideal am Mikrocontroller-Pin.",
"Optokoppler":"Überträgt ein Signal per kleinem Lichtblitz im Inneren und trennt dadurch zwei Stromkreise komplett. Schützt empfindliche Elektronik vor der gefährlichen Seite.",
"Linearregler (7805 / LM317 / AMS1117)":"Macht aus einer höheren eine feste, saubere Spannung. Einfach und ruhig, verheizt den Überschuss aber als Wärme.",
"Schaltregler / DC-DC (Buck/Boost)":"Wandelt Spannung sehr effizient herauf oder herunter, fast ohne Wärme. Die sparsame Wahl bei großem Spannungsabstand.",
"555 Timer":"Ein kleiner Taktgeber-Klassiker: erzeugt Blinken, Töne oder Zeitverzögerungen ganz ohne Mikrocontroller.",
"Logik-IC (74HCxx)":"Bausteine der digitalen Logik: verknüpfen Ein/Aus-Signale mit UND, ODER und NICHT. Quasi die Grundrechenarten der Elektronik.",
"Schieberegister (74HC595)":"Ein Pin-Vermehrer: macht aus 3 Steuerleitungen 8 Ausgänge. Praktisch, wenn dem Mikrocontroller die Anschlüsse ausgehen.",
"Mikrocontroller (Arduino / ESP32 / RP2040)":"Ein Mini-Computer auf einem Chip, der dein Programm ausführt: liest Sensoren, entscheidet, steuert. Das Gehirn der meisten Projekte.",
"Relais":"Ein elektrisch gesteuerter mechanischer Schalter, der hörbar klickt. Schaltet große oder gefährliche Lasten mit einem kleinen Signal.",
"Taster / Schalter":"Stellt eine Verbindung her oder unterbricht sie. Der Taster nur solange gedrückt, der Schalter bleibt in seiner Stellung.",
"Quarz / Oszillator":"Ein winziger Taktgeber, der sehr genau schwingt. Liefert den präzisen Herzschlag für Mikrocontroller und Uhren.",
"Sicherung":"Eine Sollbruchstelle: schmilzt bei zu viel Strom durch und unterbricht den Kreis, bevor etwas durchbrennt oder Feuer fängt.",
"Sensor-Modul (allgemein)":"Eine fertige kleine Platine, die etwas misst, etwa Temperatur, Licht, Abstand oder Bewegung, und das Ergebnis an den Mikrocontroller meldet.",
"Li-Ion / LiPo Akku":"Ein wiederaufladbarer Energiespeicher mit viel Energie auf wenig Raum. Kräftig, aber empfindlich: braucht eine Schutzschaltung und sorgsamen Umgang.",
"ESP32 DevKit (WROOM-32)":"Das Arbeitspferd unter den Funk-Boards: ein kompletter kleiner Computer mit WLAN und Bluetooth für ein paar Euro.",
"ESP32-S3 Board":"Der aufgebohrte ESP32: mehr Tempo und Speicher, und er kann sich am PC sogar als Tastatur oder Maus ausgeben.",
"ESP32-C3 Super Mini":"WLAN und Bluetooth im Daumennagel-Format. Wenn wenig Platz ist und ein Kern reicht.",
"ESP8266 D1 Mini":"Der günstige Veteran fürs WLAN: kann weniger als der ESP32, reicht aber für viele smarte Kleinigkeiten völlig.",
"Arduino Nano":"Der zuverlässige Klassiker in klein: keine Funkerei, dafür gutmütige 5-V-Logik und riesige Anleitungs-Auswahl.",
"Raspberry Pi Pico 2 (W)":"Das Sparsamkeits-Board: günstig, stromsparend und mit Python besonders einsteigerfreundlich.",
"ATtiny85 / Digispark":"Ein Mini-Gehirn für Mini-Aufgaben: wenn ein ganzes Board zu viel wäre.",
"Buck-Modul MP1584 (einstellbar)":"Ein effizienter Spannungs-Herunterdreher im Briefmarkenformat: aus 12 V werden einstellbar z. B. 5 V, fast ohne Wärme.",
"Buck-Modul mit Festspannung (3,3/5/9/12 V)":"Wie das einstellbare Buck-Modul, nur mit fest eingebauter Zielspannung: einstecken, fertig, nichts zu verstellen.",
"Buck-Modul LM2596":"Der größere, gutmütige Spannungs-Herunterdreher mit Poti, gut für etwas kräftigere Verbraucher.",
"Boost-Modul MT3608":"Der Spannungs-Hochdreher: zaubert aus einer Akkuzelle die 5 V, die viele Schaltungen brauchen.",
"Laderegler TP4056 (USB-C)":"Die kleine Ladestation für eine Li-Ion-Zelle: regelt das Laden sicher und passt an jedes USB-Netzteil.",
"Pegelwandler (Level Shifter)":"Ein Dolmetscher zwischen der 3,3-V- und der 5-V-Welt, damit sich Boards und Module verstehen, ohne sich zu beschädigen.",
"Relais-Modul":"Ein Relais mit fertig aufgebauter Ansteuerung drumherum: einfach ans Board stecken, ohne eigene Treiberschaltung.",
"RTC-Modul DS3231":"Eine Armbanduhr für dein Projekt: kennt Uhrzeit und Datum auch dann noch, wenn der Strom weg war.",
"microSD-Karten-Modul":"Ein Speicherkarten-Leser fürs Projekt: schreibt Messwerte und Dateien auf microSD.",
"WS2812-LEDs (Neopixel)":"Farb-LEDs mit eigenem Köpfchen: jede einzelne lässt sich über eine einzige Datenleitung in jede Farbe schalten.",
"OLED-Modul 0,96\" (SSD1306)":"Ein gestochen scharfes Mini-Display, das mit zwei Datenleitungen auskommt und kaum Strom braucht.",
"E-Paper-Modul (Waveshare/WeAct)":"Elektronisches Papier: zeigt sein Bild auch komplett ohne Strom weiter an, wie ein bedrucktes Blatt.",
"TFT/IPS-Modul (ST7789)":"Das bunte Fenster fürs Projekt: kräftige Farben und aus jedem Winkel gut ablesbar.",
"LCD1602 mit I²C-Adapter":"Zwei Zeilen Text im Retro-Look, dank aufgelötetem Adapter mit nur vier Drähten angeschlossen.",
"7-Segment-Modul TM1637":"Vier Leuchtziffern wie am Radiowecker: perfekt, wenn nur eine Zahl gut lesbar sein soll.",
"LDR (Fotowiderstand)":"Ein Widerstand mit Lichtgefühl: je heller, desto besser leitet er. Der einfachste Weg, Helligkeit zu messen.",
"NTC-Thermistor":"Ein Widerstand mit Wärmegefühl: je heißer, desto besser leitet er. Der einfachste Temperaturfühler.",
"DS18B20 (Temperatur, digital)":"Ein Thermometer als Bauteil, das fertige Gradzahlen liefert, auf Wunsch wasserdicht am Kabel.",
"DHT22 / AM2302 (Temp+Feuchte)":"Ein Raumklima-Wächter: misst Temperatur und Luftfeuchte in einem Gehäuse.",
"BME280 (Temp+Feuchte+Druck)":"Die kleine Wetterstation auf einem Chip: Temperatur, Feuchte und Luftdruck in präzise.",
"HC-SR04 (Ultraschall-Abstand)":"Misst Abstand wie eine Fledermaus: Schall aussenden, aufs Echo warten, Entfernung errechnen.",
"PIR-Bewegungsmelder (HC-SR501)":"Das Auge für Bewegung: erkennt die Körperwärme vorbeilaufender Menschen und Tiere.",
"MPU6050 (Beschleunigung+Gyro)":"Der Gleichgewichtssinn fürs Projekt: spürt Neigung, Bewegung und Drehung.",
"Hall-Sensor / Reed-Kontakt":"Magnet-Spürnasen: melden, wenn ein Magnet in die Nähe kommt, etwa an Tür oder Fenster.",
"Drehencoder KY-040":"Ein Drehknopf ohne Anschlag, der jedem Klick eine Richtung zuordnet, ideal für Menüs.",
"Joystick-Modul (2 Achsen)":"Ein Daumen-Steuerknüppel wie am Gamepad: zwei Richtungen plus Draufdrücken.",
"Buzzer (aktiv/passiv)":"Der Piepser: der aktive piept von allein, der passive ist ein Mini-Lautsprecher für Melodien.",
"18650-Zelle + Halter":"Der Standard-Akku in Batterieform: kräftig, wechselbar und in Haltern für jedes Projekt nutzbar.",
"LiFePO4-Zelle":"Der Sicherheits-Akku: brandträge und mit tausenden Ladezyklen, dafür mit eigener Ladelogik.",
"Knopfzelle CR2032":"Die flache Uhrenbatterie: hält jahrelang winzige Verbraucher wie eine Echtzeituhr am Leben.",
"AA/AAA & 9-V-Block":"Die Batterien aus der Küchenschublade: unkompliziert, überall erhältlich und für einfache Projekte völlig ok.",
"Solarzelle (klein)":"Ein Mini-Kraftwerk aus Licht: lädt zusammen mit Akku und Laderegler autarke Außenprojekte.",
"Jumper-Kabel (Dupont)":"Die bunten Steckkabel, mit denen auf dem Steckbrett alles mit allem verbunden wird.",
"Schaltlitze / Silikonlitze":"Draht von der Rolle zum Selbst-Zuschneiden, die Silikon-Version bleibt sogar neben dem Lötkolben weich.",
"Stiftleisten (Pin Header)":"Die Steckerleisten zum Auflöten, die Platinen und Module überhaupt erst steckbar machen.",
"JST-Steckverbinder":"Kleine Stecker mit Verwechslungsschutz: einmal richtig verkabelt, passt es immer nur richtig herum.",
"Schraubklemmen":"Kabel anschrauben statt anlöten: hält fest und lässt sich jederzeit wieder lösen.",
"Krokodilklemmen":"Die Schnellverbinder zum Anklipsen: perfekt für Messungen und schnelle Tests ohne Löten.",
"USB-Kabel & USB-Breakouts":"USB als Stromquelle und Datenweg, Breakout-Platinen machen die USB-Anschlüsse fürs Basteln zugänglich.",
"Lötzinn":"Das Verbindungsmetall: schmilzt am Kolben und erstarrt zur leitfähigen, festen Verbindung.",
"Flussmittel (Flux)":"Das Putzmittel fürs Löten: macht Oberflächen sauber, damit das Lot glatt fließt statt zu klumpen.",
"Entlötlitze":"Ein Kupfer-Schwamm für flüssiges Lot: aufsetzen, erhitzen, und die Litze saugt das Zinn weg.",
"Kapton-Band (Polyimid)":"Das Hitzeschutz-Klebeband: übersteht Löttemperaturen und schützt Nachbar-Bauteile bei Heißluft.",
"Schrumpfschlauch":"Ein Isolier-Schlauch, der sich mit Wärme festzieht und blanke Lötstellen sauber ummantelt.",
"Heißkleber":"Der schnelle Festhalter: fixiert Kabel und Module im Gehäuse und entlastet Lötstellen von Zug.",
"Isopropanol (IPA)":"Der Reinigungsalkohol: löst Flussmittelreste und Schmutz und verdunstet ohne Spuren.",
"Mini-Breadboard (170 Kontakte)":"Das Steckbrett im Westentaschenformat: für eine Handvoll Bauteile, oft direkt zum Aufkleben.",
"Lochrasterplatine":"Die Zwischenstufe zur echten Platine: getestete Schaltungen dauerhaft festlöten, Loch für Loch.",
};
const ccats=[{k:"all",l:"Alle"},{k:"passiv",l:"Passiv"},{k:"halbleiter",l:"Halbleiter"},{k:"ic",l:"IC / Aktiv"},{k:"board",l:"Boards"},{k:"modul",l:"Modul"},{k:"sensor",l:"Sensorik"},{k:"mech",l:"Elektromech."},{k:"power",l:"Stromquelle"},{k:"schutz",l:"Schutz"},{k:"kabel",l:"Kabel/Verbinder"},{k:"verbrauch",l:"Verbrauch"}];
let activeCat="all",sortCol="n",sortDir=1,expanded=null;
const ccols=[{k:"n",l:"Bauteil"},{k:"catL",l:"Kategorie"},{k:"fn",l:"Was es macht"},{k:"app",l:"Wo eingesetzt"}];
function renderC(){
const q=document.getElementById("q").value.toLowerCase();
let data=C.filter(f=>(activeCat==="all"||f.cat===activeCat)&&(!q||f.n.toLowerCase().includes(q)||f.fn.toLowerCase().includes(q)||f.app.toLowerCase().includes(q)||(CDESC[f.n]||"").toLowerCase().includes(q)||(f.det&&(f.det.kenn+f.det.kompat+f.det.achtung).toLowerCase().includes(q))));
data.sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];return sortDir*String(av).localeCompare(String(bv))});
document.getElementById("count").textContent=data.length+(data.length===1?" Bauteil":" Bauteile")+(q||activeCat!=="all"?" gefunden":"");
let th="<tr>"+ccols.map(c=>`<th onclick="doSortC('${c.k}')">${c.l}<span class="ar">${sortCol===c.k?(sortDir===1?"\u25b2":"\u25bc"):""}</span></th>`).join("")+"</tr>";
document.getElementById("thead").innerHTML=th;
let tb="";
if(data.length===0){tb=`<tr><td colspan="${ccols.length}" style="padding:20px;text-align:center;color:#888">Nichts gefunden. Anderen Suchbegriff probieren oder Filter auf „Alle" stellen.</td></tr>`}
data.forEach(f=>{
tb+=`<tr class="cat-${f.cat}" style="cursor:pointer" data-n="${f.n.replace(/"/g,"&quot;")}">`;
ccols.forEach(c=>{
if(c.k==="catL"){tb+=`<td><span class="cb">${f.catL}</span></td>`}
else if(c.k==="n"){tb+=`<td><b>${f.n}</b></td>`}
else{tb+=`<td>${f[c.k]}</td>`}
});
tb+="</tr>";
if(expanded===f.n){
const d=f.det;
tb+=`<tr class="dr"><td colspan="${ccols.length}">
${CDESC[f.n]?`<div style="margin-bottom:8px"><b>Einfach erklärt:</b> ${CDESC[f.n]}</div>`:""}
${d.bsp?`<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(127,127,127,.25)"><b>Beispiel:</b> ${d.bsp}</div>`:""}
<b>Kennwerte:</b> ${d.kenn}<br>
<b>Kompatibilität:</b> ${d.kompat}<br>
<b>Worauf achten:</b> ${d.achtung}
<div class="tags">${d.tags.map(t=>`<span class="tag${/GEPOLT|Pflicht|!|ESD/.test(t)?' warn':''}">${t}</span>`).join("")}</div>
</td></tr>`;
}
});
document.getElementById("tbody").innerHTML=tb;
}
window.doSortC=function(k){if(sortCol===k)sortDir*=-1;else{sortCol=k;sortDir=1}renderC()};
window.toggleC=function(n){expanded=expanded===n?null:n;renderC()};
document.getElementById("tbody").addEventListener("click",e=>{const tr=e.target.closest("tr[data-n]");if(tr)toggleC(tr.dataset.n)});
const cDiv=document.getElementById("cats");
ccats.forEach(c=>{const b=document.createElement("button");b.textContent=c.l;b.className=c.k==="all"?"active":"";b.onclick=()=>{activeCat=c.k;cDiv.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderC()};cDiv.appendChild(b)});
document.getElementById("q").addEventListener("input",renderC);
renderC();

/* ---------- RECHNER: LED ---------- */
function calcLED(){
const vs=parseFloat(document.getElementById("led-vs").value);
const vf=parseFloat(document.getElementById("led-vf").value);
const i=parseFloat(document.getElementById("led-i").value)/1000;
const out=document.getElementById("led-out");const note=document.getElementById("led-note");
if(isNaN(vs)||isNaN(vf)||isNaN(i)||i<=0){out.textContent="…";note.textContent="";return}
if(vf>=vs){out.textContent="Versorgung muss höher als LED-Spannung sein";note.textContent="";return}
const r=(vs-vf)/i;
// auf den nächsthöheren E12-Wert AUFrunden (kleinerer Widerstand hieße mehr Strom als geplant)
const e12=[10,12,15,18,22,27,33,39,47,56,68,82];
let best=null;
outer:for(let dec=0;dec<7;dec++){for(const e of e12){const v=e*Math.pow(10,dec);if(v>=r-1e-9){best=v;break outer}}}
if(best===null)best=82e6;
// Leistung mit dem realen Strom durch den gewählten Normwert (etwas kleiner als der Wunschstrom)
const iReal=(vs-vf)/best;
const mw=(vs-vf)*iReal*1000;
const ptxt=mw<=125?"ein 1/4-W-Widerstand (250 mW) reicht locker (unter halber Last)":mw<=250?"ein 1/4-W-Widerstand (250 mW) reicht, ist aber schon über die Hälfte ausgelastet — bei Dauerbetrieb 1/2 W nehmen":"über 250 mW — mindestens einen 1/2-W-Widerstand nehmen";
out.textContent=`R ≈ ${r.toFixed(0)} Ω  →  Normwert ${best} Ω (aufgerundet)`;
note.textContent=`Realer Strom durch ${best} Ω: ${(iReal*1000).toFixed(1)} mA · Verlustleistung am Widerstand: ${mw.toFixed(0)} mW — ${ptxt}.`;
}
["led-vs","led-vf","led-i"].forEach(id=>document.getElementById(id).addEventListener("input",calcLED));
calcLED();

/* ---------- RECHNER: OHM ---------- */
function calcOhm(){
const u=parseFloat(document.getElementById("ohm-u").value);
const i=parseFloat(document.getElementById("ohm-i").value);
const r=parseFloat(document.getElementById("ohm-r").value);
const out=document.getElementById("ohm-out");
const has=[!isNaN(u),!isNaN(i),!isNaN(r)].filter(Boolean).length;
if(has<2){out.textContent="Bitte zwei Werte eingeben";return}
let U=u,I=i,R=r;
if(has===3){
if(Math.abs(u-i*r)>Math.max(0.005,Math.abs(u)*0.01)){out.textContent=`Die drei Werte passen nicht zusammen: zu I und R gehört U = ${(i*r).toFixed(3)} V. Ein Feld leeren, dann rechne ich es aus.`;return}
}else if(isNaN(u)){U=I*R}
else if(isNaN(i)){if(R===0){out.textContent="R = 0 Ω wäre ein Kurzschluss — der Strom ist dann nicht begrenzt.";return}I=U/R}
else{if(I===0){out.textContent="Bei I = 0 A fließt nichts — R lässt sich so nicht bestimmen.";return}R=U/I}
const P=U*I;
out.innerHTML=`U = ${U.toFixed(3)} V &nbsp;·&nbsp; I = ${I.toFixed(4)} A (${(I*1000).toFixed(1)} mA) &nbsp;·&nbsp; R = ${R.toFixed(1)} Ω &nbsp;·&nbsp; P = ${P.toFixed(3)} W`;
}
["ohm-u","ohm-i","ohm-r"].forEach(id=>document.getElementById(id).addEventListener("input",calcOhm));
calcOhm();

/* ---------- RECHNER: FARBCODE ---------- */
const colors=[
{n:"Schwarz",v:0,hex:"#000000",mult:1,tol:null},
{n:"Braun",v:1,hex:"#5a3210",mult:10,tol:"±1%"},
{n:"Rot",v:2,hex:"#c0392b",mult:100,tol:"±2%"},
{n:"Orange",v:3,hex:"#e67e22",mult:1000,tol:null},
{n:"Gelb",v:4,hex:"#f1c40f",mult:10000,tol:null},
{n:"Grün",v:5,hex:"#27ae60",mult:100000,tol:"±0,5%"},
{n:"Blau",v:6,hex:"#2980b9",mult:1000000,tol:"±0,25%"},
{n:"Violett",v:7,hex:"#8e44ad",mult:10000000,tol:"±0,1%"},
{n:"Grau",v:8,hex:"#7f8c8d",mult:100000000,tol:"±0,05%"},
{n:"Weiß",v:9,hex:"#ecf0f1",mult:1000000000,tol:null},
{n:"Gold",v:null,hex:"#c9a227",mult:0.1,tol:"±5%"},
{n:"Silber",v:null,hex:"#bdc3c7",mult:0.01,tol:"±10%"},
];
function fillSel(id,type){
const s=document.getElementById(id);s.innerHTML="";
colors.forEach((c,idx)=>{
if(type==="digit"&&c.v===null)return;
if(type==="mult"&&c.mult===null)return;
if(type==="tol"&&c.tol===null)return;
const o=document.createElement("option");o.value=idx;o.textContent=c.n;s.appendChild(o);
});
}
fillSel("b1","digit");fillSel("b2","digit");fillSel("b3","mult");fillSel("b4","tol");
document.getElementById("b1").value=1;document.getElementById("b2").value=0;document.getElementById("b3").value=2;document.getElementById("b4").value=10;
function calcBand(){
const c1=colors[document.getElementById("b1").value];
const c2=colors[document.getElementById("b2").value];
const c3=colors[document.getElementById("b3").value];
const c4=colors[document.getElementById("b4").value];
document.getElementById("cb1").style.background=c1.hex;
document.getElementById("cb2").style.background=c2.hex;
document.getElementById("cb3").style.background=c3.hex;
document.getElementById("cb4").style.background=c4.hex;
const nice=x=>String(parseFloat(x.toPrecision(6)));
let val=(c1.v*10+c2.v)*c3.mult;
let disp;
if(val>=1e9)disp=nice(val/1e9)+" GΩ";
else if(val>=1e6)disp=nice(val/1e6)+" MΩ";
else if(val>=1e3)disp=nice(val/1e3)+" kΩ";
else disp=nice(val)+" Ω";
document.getElementById("band-out").textContent=`${disp}  ${c4.tol}`;
}
["b1","b2","b3","b4"].forEach(id=>document.getElementById(id).addEventListener("change",calcBand));
calcBand();

/* ---------- RECHNER: SPANNUNGSTEILER ---------- */
function calcVT(){
const vin=parseFloat(document.getElementById("vt-in").value);
const r1=parseFloat(document.getElementById("vt-r1").value);
const r2=parseFloat(document.getElementById("vt-r2").value);
const out=document.getElementById("vt-out");
if(isNaN(vin)||isNaN(r1)||isNaN(r2)||(r1+r2)<=0){out.textContent="…";return}
const vout=vin*r2/(r1+r2);
out.textContent=`Ausgang ≈ ${vout.toFixed(3)} V`;
}
["vt-in","vt-r1","vt-r2"].forEach(id=>document.getElementById(id).addEventListener("input",calcVT));
calcVT();

/* ---------- RECHNER: gemeinsame Helfer ---------- */
const E12=[10,12,15,18,22,27,33,39,47,56,68,82];
/* naechster Normwert der E12-Reihe, wahlweise auf- oder abgerundet */
function e12near(r,up){
  if(!(r>0))return null;
  let lo=null,hi=null;
  for(let dec=-2;dec<9;dec++){for(const e of E12){const v=e*Math.pow(10,dec);
    if(v<=r+1e-12)lo=v; if(hi===null&&v>=r-1e-12)hi=v;}}
  return up?(hi===null?lo:hi):(lo===null?hi:lo);
}
function fmtR(v){
  if(v===null||!isFinite(v))return"—";
  const nice=x=>String(parseFloat(x.toPrecision(4)));
  if(v>=1e6)return nice(v/1e6)+" MΩ";
  if(v>=1e3)return nice(v/1e3)+" kΩ";
  return nice(v)+" Ω";
}
/* verdrahtet eine Rechenfunktion an ihre Eingabefelder; fehlt ein Feld, passiert nichts */
function wire(ids,fn){
  const els=ids.map(id=>document.getElementById(id));
  if(els.some(e=>!e))return;
  els.forEach(e=>e.addEventListener("input",fn));
  els.forEach(e=>{if(e.tagName==="SELECT")e.addEventListener("change",fn)});
  fn();
}

/* ---------- SPANNUNGSTEILER: Hinweis zur Belastbarkeit ---------- */
function noteVT(){
  const n=document.getElementById("vt-note");if(!n)return;
  const vin=parseFloat(document.getElementById("vt-in").value);
  const r1=parseFloat(document.getElementById("vt-r1").value);
  const r2=parseFloat(document.getElementById("vt-r2").value);
  if(isNaN(vin)||isNaN(r1)||isNaN(r2)||(r1+r2)<=0){n.textContent="";return}
  const i=vin/(r1+r2), p=vin*i;
  n.textContent=`Querstrom durch den Teiler: ${(i*1000).toFixed(2)} mA · Verlustleistung gesamt ${(p*1000).toFixed(1)} mW. `
    +`Damit der Ausgang stabil bleibt, muss der angeschlossene Verbraucher mindestens ${fmtR(r2*10)} haben (Zehnfaches von R2) — `
    +`sonst bricht die Spannung unter Last ein.`;
}
wire(["vt-in","vt-r1","vt-r2"],noteVT);

/* ---------- RECHNER: RC-GLIED ---------- */
function calcRC(){
  const out=document.getElementById("rc-out"),note=document.getElementById("rc-note");
  const r=parseFloat(document.getElementById("rc-r").value);
  const c=parseFloat(document.getElementById("rc-c").value)*parseFloat(document.getElementById("rc-cu").value);
  if(!(r>0)||!(c>0)){out.textContent="…";note.textContent="";return}
  const tau=r*c, fg=1/(2*Math.PI*r*c);
  const t=s=>s>=1?s.toFixed(2)+" s":s>=1e-3?(s*1e3).toFixed(2)+" ms":(s*1e6).toFixed(1)+" µs";
  const f=x=>x>=1e6?(x/1e6).toFixed(2)+" MHz":x>=1e3?(x/1e3).toFixed(2)+" kHz":x.toFixed(2)+" Hz";
  out.textContent=`τ = ${t(tau)}  ·  Grenzfrequenz f_g = ${f(fg)}`;
  note.textContent=`Nach 1 τ ist der Kondensator auf 63 % geladen, nach 5 τ (${t(tau*5)}) praktisch voll. `
    +`Als Tiefpass bleibt bei ${f(fg)} noch 70 % übrig, darüber sinkt es um Faktor 10 je Faktor 10 Frequenz. `
    +`Als Entprellung sind 20–50 ms üblich.`;
}
wire(["rc-r","rc-c","rc-cu"],calcRC);

/* ---------- RECHNER: VERLUSTLEISTUNG ---------- */
function calcPW(){
  const out=document.getElementById("pw-out"),note=document.getElementById("pw-note");
  const uin=parseFloat(document.getElementById("pw-uin").value);
  const uout=parseFloat(document.getElementById("pw-uout").value);
  const i=parseFloat(document.getElementById("pw-i").value)/1000;
  if(isNaN(uin)||isNaN(uout)||isNaN(i)){out.textContent="…";note.textContent="";return}
  const du=uin-uout;
  if(du<0){out.textContent="Die Spannung dahinter kann nicht größer sein als davor";note.textContent="";return}
  const p=du*i;
  out.textContent=`Spannungsabfall ${du.toFixed(2)} V × ${(i*1000).toFixed(0)} mA  →  ${p<1?(p*1000).toFixed(0)+" mW":p.toFixed(2)+" W"} Wärme`;
  const wirk=uin>0?(uout/uin*100):0;
  let rat;
  if(p<=0.25)rat="Unkritisch — ein kleines Gehäuse ohne Kühlkörper reicht.";
  else if(p<=1)rat="Wird deutlich warm. Kühlfläche vorsehen oder auf ein größeres Gehäuse gehen.";
  else if(p<=3)rat="Kühlkörper nötig. Ohne Kühlung schaltet ein Linearregler thermisch ab.";
  else rat="Zu viel für einen Linearregler — hier gehört ein Schaltregler hin.";
  note.textContent=`Wirkungsgrad bei einem Linearregler: ${wirk.toFixed(0)} %. ${rat} `
    +`Faustregel: Bauteile nur bis zur halben Datenblatt-Angabe belasten (Tab Datenblatt lesen).`;
}
wire(["pw-uin","pw-uout","pw-i"],calcPW);

/* ---------- RECHNER: WIDERSTAENDE KOMBINIEREN ---------- */
function calcRR(){
  const out=document.getElementById("rr-out");
  const a=parseFloat(document.getElementById("rr-1").value);
  const b=parseFloat(document.getElementById("rr-2").value);
  if(!(a>0)||!(b>0)){out.textContent="…";return}
  out.textContent=`Reihe: ${fmtR(a+b)}   ·   Parallel: ${fmtR(a*b/(a+b))}`;
}
wire(["rr-1","rr-2"],calcRR);

/* ---------- RECHNER: BASISWIDERSTAND ---------- */
function calcTB(){
  const out=document.getElementById("tb-out"),note=document.getElementById("tb-note");
  const u=parseFloat(document.getElementById("tb-u").value);
  const il=parseFloat(document.getElementById("tb-i").value)/1000;
  const h=parseFloat(document.getElementById("tb-h").value);
  if(!(u>0.7)||!(il>0)||!(h>0)){out.textContent=u<=0.7?"Pin-Spannung muss über 0,7 V liegen":"…";note.textContent="";return}
  const ib=il/h, r=(u-0.7)/ib, norm=e12near(r,false);
  out.textContent=`Basisstrom ${(ib*1000).toFixed(2)} mA  →  R_B ≈ ${fmtR(r)}  →  Normwert ${fmtR(norm)}`;
  const ibReal=(u-0.7)/norm;
  note.textContent=`Hier wird auf den nächstkleineren Normwert abgerundet, damit der Basisstrom eher zu groß als zu klein ist — `
    +`nur ein voll durchgeschalteter Transistor bleibt kühl. Realer Basisstrom: ${(ibReal*1000).toFixed(2)} mA, `
    +`Belastung des steuernden Pins ebenfalls ${(ibReal*1000).toFixed(2)} mA (Mikrocontroller-Pins vertragen typisch 20–40 mA). `
    +`Bei einem MOSFET entfällt diese Rechnung: dort genügen 100–220 Ω in die Gate-Leitung und 10–100 kΩ vom Gate nach Masse.`;
}
wire(["tb-u","tb-i","tb-h"],calcTB);

/* ---------- VERGLEICHSMATRIZEN ---------- */
function rateColor(v){if(v<=3)return"var(--rate-bad)";if(v<=6)return"var(--rate-mid)";return"var(--rate-good)";}
function renderRating(containerId,headers,rows){
let h="<div class='tbl-wrap'><table style='min-width:700px'><thead><tr>";
headers.forEach((hd,i)=>h+=`<th style='${i===0?"":"min-width:88px"}'>${hd}</th>`);
h+="</tr></thead><tbody>";
rows.forEach(r=>{
h+=`<tr><td><b>${r.name}</b></td>`;
r.vals.forEach(v=>{
h+=`<td><div class='rate'><div class='rate-bar'><div class='rate-fill' style='width:${v*10}%;background:${rateColor(v)}'></div></div><span class='rate-num'>${v}</span></div></td>`;
});
h+="</tr>";
});
h+="</tbody></table></div>";
document.getElementById(containerId).innerHTML=h;
}
renderRating("motor-rating",
["Typ","Präzision","Kraft","Tempo","Einfachheit","Langlebig","Günstig"],
[
{name:"Gleichstrommotor",vals:[2,4,8,9,5,9]},
{name:"Getriebemotor",vals:[3,9,3,9,6,7]},
{name:"Servo",vals:[7,6,5,8,6,7]},
{name:"Schrittmotor",vals:[10,7,5,5,9,6]},
{name:"BLDC",vals:[5,8,10,3,10,4]},
]);
renderRating("display-rating",
["Typ","Schärfe","Farbe","Sparsam","Tempo","Sonnenlicht","Günstig"],
[
{name:"OLED",vals:[9,2,8,8,5,8]},
{name:"TFT",vals:[7,9,4,8,4,8]},
{name:"IPS",vals:[8,10,4,8,5,6]},
{name:"E-Paper",vals:[7,2,10,1,10,4]},
{name:"Zeichen-LCD",vals:[3,1,6,6,6,9]},
]);
renderRating("mcu-rating",
["Board","Leistung","Funk","Einsteiger","Community","Sparsam","Günstig"],
[
{name:"Arduino Uno/Nano",vals:[3,1,10,10,4,7]},
{name:"ESP32",vals:[8,10,7,9,6,8]},
{name:"ESP8266",vals:[5,6,6,7,5,9]},
{name:"Pico 2 (W)",vals:[7,4,8,7,8,9]},
{name:"STM32",vals:[9,1,3,6,7,6]},
]);

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
