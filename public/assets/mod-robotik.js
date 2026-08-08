/* Modul-Skript (nativ) — Funktions-JS aus robotik-referenz.html; View-Code entfaellt. */
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

/* ============================================================
   DATEN: GRUNDLAGEN
   ============================================================ */
const GRUND=[
{g:"anatomie",t:"Sense, Plan, Act",d:"Die Grundschleife jedes autonomen Roboters: wahrnehmen (Sensoren), entscheiden (Planung) und handeln (Aktuatoren). Laeuft staendig im Kreis. Fast jede Robotik-Architektur ist eine Variante davon.",p:"Im Code ist das oft eine Schleife mit fester Frequenz (z.B. 50 oder 100 Hz), die Sensoren liest, rechnet und Stellbefehle schreibt."},
{g:"anatomie",t:"Freiheitsgrade (DOF)",d:"Anzahl unabhaengiger Bewegungsmoeglichkeiten. Jedes angetriebene Gelenk ist meist 1 DOF. Ein typischer Roboterarm hat 6 DOF, damit er jede Position UND Orientierung im Raum erreichen kann.",p:"Fuer freies Greifen brauchst du 6 DOF. Weniger reicht oft fuer einfachere Aufgaben (3 DOF fuer Pick-and-Place auf einer Ebene)."},
{g:"anatomie",t:"Link und Joint (Glied und Gelenk)",d:"Ein Roboter ist eine Kette aus starren Gliedern (Links), verbunden durch Gelenke (Joints). Gelenke sind drehend (revolute, wie ein Scharnier) oder schiebend (prismatic, wie ein Linearschlitten).",p:"Genau diese Struktur beschreibst du spaeter in einer URDF-Datei, damit ROS2 deinen Roboter kennt."},
{g:"anatomie",t:"Endeffektor / TCP",d:"Das Werkzeug am Ende der Kette: Greifer, Saugnapf, Stift, Kamera. Der TCP (Tool Center Point) ist der exakte Punkt, dessen Position und Orientierung du steuern willst.",p:"Beim Programmieren gibst du Ziele meist fuer den TCP an, nicht fuer einzelne Gelenke."},
{g:"anatomie",t:"Arbeitsraum (Workspace)",d:"Der gesamte Bereich, den der Endeffektor erreichen kann. Begrenzt durch Gliedlaengen und Gelenkgrenzen. Ausserhalb davon gibt es keine Loesung, egal wie du die Gelenke stellst.",p:"Wichtig beim Konstruieren: das Bauteil muss im Arbeitsraum liegen, sonst kommt der Arm nicht ran."},
{g:"kinematik",t:"Vorwaertskinematik",d:"Von den Gelenkwinkeln zur Pose des Endeffektors. Wenn du weisst, wie jedes Gelenk steht, kannst du eindeutig ausrechnen, wo die Werkzeugspitze ist. Hat immer genau eine Loesung.",p:"Brauchst du, um aus Encoder-Werten die aktuelle Position des Arms anzuzeigen."},
{g:"kinematik",t:"Inverse Kinematik (IK)",d:"Die Umkehrung und der schwierigere Teil: von der gewuenschten Pose zurueck zu den Gelenkwinkeln. Kann mehrere Loesungen haben (Ellbogen oben oder unten) oder gar keine.",p:"MoveIt2 in ROS2 loest die IK fuer dich. Selbst rechnen muss man nur bei eigenen oder exotischen Kinematiken."},
{g:"kinematik",t:"Konfigurationsraum (C-Space)",d:"Der Raum aller moeglichen Gelenkstellungen. Ein 6-Achs-Arm hat einen 6-dimensionalen C-Space. Bewegungsplanung sucht darin einen kollisionsfreien Weg vom Start zum Ziel.",p:"Abstraktes Konzept, aber genau hier arbeiten Bahnplaner. Du merkst es als Nutzer kaum direkt."},
{g:"kinematik",t:"Pose (Position und Orientierung)",d:"Die vollstaendige Lage eines Objekts im Raum: wo es ist (Position, 3 Werte) und wie es gedreht ist (Orientierung, 3 Werte). Zusammen 6 Werte, daher die 6 DOF fuer freies Greifen.",p:"In ROS2 ist Pose ein Standard-Datentyp, der staendig zwischen Knoten verschickt wird."},
{g:"kinematik",t:"Singularitaet",d:"Eine Gelenkstellung, in der der Arm kurzzeitig einen Freiheitsgrad verliert (z.B. zwei Achsen fluchten). Nahe einer Singularitaet drehen Gelenke ploetzlich extrem schnell, um kleine Bewegungen auszugleichen.",p:"Aeussert sich real als ruckartiges, gefaehrlich schnelles Zucken. Planer versuchen Singularitaeten zu umfahren."},
{g:"kinematik",t:"Bahn vs Pfad (Trajectory vs Path)",d:"Ein Pfad ist nur die geometrische Spur (welche Punkte). Eine Bahn (Trajektorie) hat zusaetzlich das Timing: wann der Roboter wo ist, mit welcher Geschwindigkeit und Beschleunigung.",p:"Ein sauberer, ruckarmer Bewegungsablauf entsteht durch die Trajektorie, nicht nur durch den Pfad."},
{g:"wahrnehmung",t:"Koordinatensysteme / Frames / TF",d:"Jedes Teil hat sein eigenes Koordinatensystem (Frame): Basis, Gelenk, Kamera, Werkzeug. Um Messungen zu vergleichen, muss man zwischen Frames umrechnen. ROS2 macht das mit dem TF-System.",p:"TF ist eine der wichtigsten und anfangs verwirrendsten ROS2-Faehigkeiten. Wer TF versteht, hat halb gewonnen."},
{g:"wahrnehmung",t:"Quaternion vs Euler-Winkel",d:"Zwei Wege, Orientierung zu beschreiben. Euler (Roll, Pitch, Yaw) ist intuitiv, hat aber den Gimbal-Lock-Fehler. Quaternionen (4 Werte) sind unanschaulich, aber mathematisch sauber und ohne diesen Fehler.",p:"ROS2 nutzt intern Quaternionen. Zur Anzeige rechnet man sie oft in Euler um."},
{g:"wahrnehmung",t:"Odometrie",d:"Schaetzung der eigenen Position aus Bewegungsdaten, z.B. wie weit sich die Raeder gedreht haben. Driftet mit der Zeit, weil sich kleine Fehler aufsummieren (Schlupf, Ungenauigkeit).",p:"Allein nie genau genug fuer lange Strecken. Wird mit IMU und Lidar/Kamera fusioniert."},
{g:"wahrnehmung",t:"Lokalisierung",d:"Die Frage Wo bin ich? in einer bekannten Karte beantworten. Kombiniert Odometrie mit Sensorabgleich gegen die Karte, um den Drift zu korrigieren.",p:"In ROS2 erledigt das z.B. AMCL (fuer 2D-Lidar-Karten) im Nav2-Stack."},
{g:"wahrnehmung",t:"SLAM",d:"Simultaneous Localization and Mapping. Der Roboter baut eine Karte einer unbekannten Umgebung und lokalisiert sich gleichzeitig darin. Henne-Ei-Problem, das elegant gemeinsam geloest wird.",p:"Praktisch sehr greifbar: ein Saugroboter macht genau das. Fuer 2D gibt es slam_toolbox in ROS2."},
{g:"wahrnehmung",t:"Sensorfusion",d:"Mehrere Sensoren kombinieren, um besser zu schaetzen als jeder einzeln. Klassiker: Rad-Odometrie (genau kurzfristig) plus IMU (gut bei Drehung) plus GPS/Lidar (driftfrei langfristig).",p:"Der Kalman-Filter (bzw. EKF) ist das Standardwerkzeug. In ROS2: robot_localization."},
{g:"architektur",t:"Regelkreis (offen vs geschlossen)",d:"Offener Kreis (open loop): einfach ein Kommando geben und hoffen (z.B. Schrittmotor ohne Rueckmeldung). Geschlossener Kreis (closed loop): messen, mit dem Soll vergleichen, nachregeln. Genauer, aber aufwendiger.",p:"Ein Hobby-Servo ist intern schon closed loop. Ein nackter Stepper ist open loop, bis du einen Encoder dranbaust."},
{g:"architektur",t:"Embodiment / Morphologie",d:"Die Idee, dass der Koerper des Roboters (Form, Material, Sensorlage) ein Teil der Loesung ist, nicht nur die Software. Ein gut geformter Greifer braucht weniger Rechenintelligenz.",p:"Fuer einen Maker oft befreiend: clevere Mechanik ersetzt komplexen Code."},
{g:"architektur",t:"Echtzeit (Real-time)",d:"Garantie, dass eine Berechnung innerhalb einer festen Zeit fertig ist. Wichtig fuer stabile Regelung. Ein normales Betriebssystem (auch Linux) ist nicht hart echtzeitfaehig.",p:"Deshalb laeuft die schnelle Motorregelung oft auf einem Mikrocontroller, die Planung auf dem Raspberry Pi."},
];

/* ============================================================
   DATEN: HARDWARE
   ============================================================ */
const HW=[
/* AKTUATOREN */
{n:"DC-Getriebemotor",cat:"aktuator",catL:"Aktuator",bd:"b-blue",spec:"3-24 V, mit Getriebe",desc:"Gleichstrommotor mit angeflanschtem Getriebe fuer Drehmoment statt Drehzahl.",fkt:"Dreht schnell und schwach, das Getriebe macht daraus langsam und kraeftig. Guenstig und einfach anzusteuern (Spannung an, dreht). Richtung ueber Polung, Drehzahl ueber PWM.",anw:"Antrieb fahrender Roboter, einfache Bewegungen. Mit H-Bruecke (Treiber) ansteuern. Fuer Positionsregelung Encoder noetig.",hobby:"Der Einsteiger-Antrieb. Gelbe Hobby-Motoren oder Pololu-Metallgetriebemotoren. Mit Encoder-Version direkt closed-loop-faehig.",tipp:["Anlaufstrom ist viel hoeher als Dauerstrom, Treiber entsprechend dimensionieren","Ohne Encoder nur open loop, keine genaue Position","Untersetzung bestimmt Drehmoment vs Drehzahl"]},
{n:"BLDC-Motor (buerstenlos)",cat:"aktuator",catL:"Aktuator",bd:"b-blue",spec:"je nach kV, 3-phasig",desc:"Buerstenloser Motor, braucht elektronische Kommutierung statt Schleifkontakte.",fkt:"Sehr effizient, langlebig (keine Buersten) und leistungsdicht. Braucht aber einen ESC oder FOC-Treiber, der die drei Phasen elektronisch schaltet. Mit Encoder extrem praezise und kraftvoll regelbar.",anw:"Drohnen, schnelle Antriebe, moderne Roboterarme (Direktantrieb), Hoverboard-Motoren als guenstige Quelle.",hobby:"Steigender Trend dank FOC-Treibern wie SimpleFOC oder ODrive. Hoverboard-Motoren plus VESC sind eine beliebte DIY-Quelle fuer starke Achsen.",tipp:["kV-Wert = Umdrehungen pro Volt, niedrig kV heisst mehr Drehmoment","FOC braucht Encoder und Einarbeitung, lohnt sich aber","ESC (Drohne) ist einfacher, aber nur fuer schnelles Drehen"]},
{n:"Hobby-Servo (RC)",cat:"aktuator",catL:"Aktuator",bd:"b-blue",spec:"4.8-7.4 V, 0-180 Grad",desc:"Kompakter Motor mit Getriebe und interner Lageregelung, faehrt einen Winkel an.",fkt:"Bekommt ein PWM-Signal und haelt selbsttaetig den entsprechenden Winkel (intern closed loop). Sehr einfach: ein Steuerpin, fertig. Begrenzt auf meist 180 Grad und maessiges Drehmoment.",anw:"Gelenke kleiner Arme, Greifer, Kamera-Schwenker, Laufroboter-Beine. Ideal zum schnellen Prototypen.",hobby:"Der schnellste Weg zu Bewegung. SG90 (winzig, Plastikgetriebe) bis MG996R (Metallgetriebe, kraeftiger). Direkt vom Mikrocontroller steuerbar.",tipp:["Eigene, stabile Stromversorgung, nicht aus dem MCU-Pin speisen","Billige Servos zittern und sind ungenau","Fuer Dauerlast Metallgetriebe waehlen"]},
{n:"Smart-Servo (seriell)",cat:"aktuator",catL:"Aktuator",bd:"b-blue",spec:"Dynamixel / Feetech",desc:"Digitales Servo mit Bus-Ansteuerung und Positionsrueckmeldung.",fkt:"Wie ein Hobby-Servo, aber per Datenbus (seriell) angesteuert und vernetzbar. Liefert Position, Last, Temperatur zurueck, oft 360 Grad oder Endlosdrehung, einstellbares Drehmoment.",anw:"Hochwertige Arme, Laufroboter, alles wo man echte Rueckmeldung und saubere Verkettung braucht. Genau die Servos im LeRobot-Arm aus dem Post.",hobby:"Feetech STS-Serie ist guenstig und LeRobot-kompatibel. Dynamixel ist der teurere Industriestandard. Viele Servos haengen an einem Bus.",tipp:["Feetech ist das Preis-Leistungs-Tor zu echtem Robot Learning","IDs vergeben, sonst Buskonflikt","Brauchen eine Bus-Adapterplatine zum MCU/PC"]},
{n:"Schrittmotor (Stepper)",cat:"aktuator",catL:"Aktuator",bd:"b-blue",spec:"NEMA 17 / 23, 1.8 Grad",desc:"Motor, der sich in festen Schritten dreht, haelt Position ohne Sensor.",fkt:"Dreht pro Puls einen festen Winkel (z.B. 1.8 Grad = 200 Schritte/Umdrehung). Praezise und haltestark im Stillstand, aber open loop: bei Ueberlast verliert er Schritte unbemerkt.",anw:"3D-Drucker, CNC, Linearachsen, ueberall wo exakte, wiederholbare Position ohne Encoder gefragt ist. Kennst du aus deinen Druckern.",hobby:"NEMA 17 ist der Standard. Mit Mikroschritt-Treiber (TMC2209) leise und fein. Fuer mehr Kraft NEMA 23.",tipp:["Schrittverlust bei Ueberlast, nicht zu knapp dimensionieren","Mikroschritt erhoeht Aufloesung, nicht das Drehmoment","TMC-Treiber sind leise (StealthChop), gut fuer Wohnraum"]},
{n:"Linearaktuator",cat:"aktuator",catL:"Aktuator",bd:"b-blue",spec:"Hub 50-300 mm",desc:"Erzeugt geradlinige Schub- und Zugbewegung statt Drehung.",fkt:"Wandelt Motordrehung intern (Spindel) in eine Linearbewegung. Liefert hohe Schubkraft, haelt Position oft selbsthemmend. Langsam, aber kraeftig.",anw:"Hebebuehnen, verstellbare Klappen, lineare Achsen ohne eigene Mechanik, Beine schwerer Roboter.",hobby:"Fertige Einheiten mit Endschaltern sind bequem. Alternativ selbst aus Stepper plus Spindel plus Linearfuehrung bauen.",tipp:["Auf Hub und Schubkraft achten","Viele sind nur open loop (Endlagen per Schalter)","Eigenbau aus Spindel ist oft guenstiger und flexibler"]},

/* TREIBER & LEISTUNG */
{n:"H-Bruecke / DC-Motortreiber",cat:"treiber",catL:"Treiber",bd:"b-purple",spec:"DRV8833, TB6612, BTS7960",desc:"Schaltstufe, die Richtung und Tempo eines DC-Motors steuert.",fkt:"Vier Schalter (Transistoren), die den Motor in beide Richtungen bestromen koennen. Der MCU gibt nur kleine Logiksignale (Richtung + PWM), die Bruecke schaltet den dicken Motorstrom.",anw:"Zwischen Mikrocontroller und jedem DC-Motor. Ohne Treiber kein Motor, der MCU-Pin kann den Strom nicht liefern.",hobby:"TB6612 fuer kleine Motoren, BTS7960 fuer kraeftige. DRV8833 ist winzig und guenstig. Achte auf Dauerstrom.",tipp:["Dauerstrom des Treibers ueber Motor-Dauerstrom waehlen","Freilaufdioden meist integriert, aber pruefen","Logik- und Motorspannung getrennt versorgen"]},
{n:"Schrittmotor-Treiber",cat:"treiber",catL:"Treiber",bd:"b-purple",spec:"TMC2209, A4988, DRV8825",desc:"Treiber, der Schritte und Mikroschritte fuer Stepper erzeugt.",fkt:"Bekommt Step- und Dir-Pulse und schaltet die Spulen entsprechend, inkl. Mikroschritt und Strombegrenzung. TMC-Typen koennen leise fahren und sogar Schrittverlust erkennen (StallGuard).",anw:"Jeder Schrittmotor braucht einen. Step/Dir vom MCU oder von einem Motion-Controller.",hobby:"TMC2209 ist die Empfehlung: leise, sparsam, UART-konfigurierbar. A4988/DRV8825 sind aelter, lauter, aber guenstig.",tipp:["Motorstrom (Vref) korrekt einstellen, sonst Hitze oder Schrittverlust","Kuehlung nicht vergessen","UART-Modus bei TMC erlaubt Einstellung per Software"]},
{n:"FOC-Treiber / ESC",cat:"treiber",catL:"Treiber",bd:"b-purple",spec:"ODrive, VESC, SimpleFOC",desc:"Steuerung fuer buerstenlose Motoren mit feldorientierter Regelung.",fkt:"Schaltet die drei Phasen eines BLDC praezise und liest dabei den Encoder, um Drehmoment, Drehzahl oder Position sauber zu regeln. Ein einfacher ESC kann nur Drehzahl (Drohne).",anw:"Praezise BLDC-Achsen, kraftvolle Direktantriebe, Balancier- und Laufroboter mit Hoverboard-Motoren.",hobby:"VESC (urspruenglich E-Skateboard) und ODrive sind die DIY-Stars. SimpleFOC ist eine Arduino-Bibliothek fuer eigene Treiber.",tipp:["Encoder ist Pflicht fuer echte FOC","Kalibrierung pro Motor noetig","Einarbeitung lohnt, aber kein Wochenend-Plug-and-Play"]},
{n:"LiPo-/Li-Ion-Akku",cat:"power",catL:"Energie",bd:"b-amber",spec:"3.7 V pro Zelle, 1S-6S",desc:"Wiederaufladbarer Energiespeicher mit hoher Leistungsdichte.",fkt:"Liefert viel Strom auf kleinem Raum. Zellzahl (S) bestimmt die Spannung (3S = 11.1 V), die C-Rate den maximalen Entladestrom. Empfindlich gegen Tiefentladung und Ueberladung.",anw:"Mobile Roboter, Drohnen, alles ohne Kabel. Mit BMS (Schutzschaltung) und passendem Laderaet betreiben.",hobby:"Sehr verbreitet, aber respektvoll behandeln. LiFePO4 ist sicherer und langlebiger, dafuer schwerer. Fuer stationaere Versuche oft Netzteil bequemer.",tipp:["Brandgefahr bei Beschaedigung, niemals unbeaufsichtigt laden","Balancer-Stecker zum gleichmaessigen Laden nutzen","Nicht unter Zellspannung-Minimum entladen"]},
{n:"Spannungsregler (Buck/Boost)",cat:"power",catL:"Energie",bd:"b-amber",spec:"Step-down / Step-up",desc:"Wandelt eine Spannung effizient in eine andere um.",fkt:"Buck (Step-down) macht aus hoher Spannung eine niedrigere (12 V auf 5 V), Boost (Step-up) das Gegenteil. Schaltregler sind effizient und werden kaum warm, anders als Linearregler.",anw:"Versorgt Logik (5 V/3.3 V) aus dem Akku, trennt empfindliche Elektronik von der Motorspannung.",hobby:"Fertige Buck-Module (auf Basis LM2596 oder MP1584) sind billig und praktisch. Fuer saubere 5 V zum Pi/MCU fast immer noetig.",tipp:["Genug Reserve beim Ausgangsstrom einplanen","Motoren und Logik moeglichst getrennt versorgen","Bei Stoerungen Stuetzkondensatoren ergaenzen"]},

/* SENSOREN */
{n:"IMU (Gyro + Beschleunigung)",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"MPU6050, BNO055, 6/9-Achsen",desc:"Misst Drehrate und Beschleunigung, optional Magnetfeld.",fkt:"Gyroskop misst Drehgeschwindigkeit, Beschleunigungssensor die Beschleunigung (inkl. Schwerkraft als Referenz nach unten). Zusammen ergibt das die Lage im Raum. 9-Achsen-Typen haben zusaetzlich einen Kompass.",anw:"Lagebestimmung von Drohnen, Balancierrobotern, Schaetzung der Orientierung, Sturzerkennung. Wird mit Odometrie fusioniert.",hobby:"MPU6050 ist der guenstige Klassiker (Rohdaten, selbst filtern). BNO055 rechnet die Orientierung intern, viel bequemer.",tipp:["Gyro driftet, Accel ist verrauscht, daher fusionieren","BNO055 spart die Filter-Mathematik","Kalibrierung verbessert die Werte deutlich"]},
{n:"Encoder (Drehgeber)",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"inkrementell / absolut",desc:"Misst Drehwinkel und Drehrichtung einer Welle.",fkt:"Inkrementell zaehlt Pulse (Quadratur erkennt auch die Richtung), kennt aber keine absolute Position nach dem Einschalten. Absolut kennt den Winkel sofort. Macht aus open loop ein closed loop.",anw:"An jedem Motor, dessen Position du genau kennen willst. Pflicht fuer geregelte Arme und FOC.",hobby:"Magnetische Absolut-Encoder (AS5600) sind guenstig und kontaktlos. Viele Getriebemotoren gibt es mit angebautem Quadratur-Encoder.",tipp:["Quadratur fuer Richtungserkennung","Absolut-Encoder spart Referenzfahrt","Aufloesung muss zur gewuenschten Genauigkeit passen"]},
{n:"ToF-Distanzsensor",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"VL53L0X/L1X, bis ~2-4 m",desc:"Misst Entfernung ueber die Laufzeit eines Lichtpulses.",fkt:"Sendet einen Infrarot-Puls und misst, wie lange er bis zur Rueckkehr braucht. Praezise, kompakt, kaum von Oberflaeche abhaengig. Schmaler Messkegel.",anw:"Hinderniserkennung, Abstandhalten, einfache Hoehenmessung. Genauer als Ultraschall.",hobby:"VL53L0X (bis ~2 m) und L1X (bis ~4 m) sind klein und per I2C einfach. Mehrere fuer Rundumsicht moeglich.",tipp:["Glanz und dunkle Flaechen koennen stoeren","Schmaler Kegel, deckt nur einen Punkt ab","Per I2C-Adresse mehrere parallel betreiben"]},
{n:"Ultraschallsensor",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"HC-SR04, 2-400 cm",desc:"Misst Abstand ueber reflektierten Schall.",fkt:"Sendet einen Ultraschallpuls und misst die Echo-Laufzeit. Sehr guenstig und robust, aber ungenau, langsam und mit breitem Kegel. Probleme bei schraegen oder weichen Flaechen.",anw:"Grobe Hinderniserkennung, einfache Roboter, Parkhilfe-Niveau. Der klassische Einsteiger-Distanzsensor.",hobby:"HC-SR04 ist spottbillig und ueberall. Fuer ernsthafte Navigation aber zu grob, dann ToF oder Lidar.",tipp:["Breiter Kegel erfasst auch ungewollte Objekte","Schallschluckende Stoffe liefern kein Echo","Mehrere stoeren sich gegenseitig (nacheinander messen)"]},
{n:"Lidar (2D/3D)",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"RPLidar, bis 8-12 m",desc:"Rotierender Laserscanner, der die Umgebung als Punkte erfasst.",fkt:"Misst per Laser-Laufzeit rundum die Abstaende und liefert eine Punktwolke. 2D-Lidar scannt eine Ebene (guenstig), 3D-Lidar den ganzen Raum (teuer). Grundlage fuer Kartierung.",anw:"SLAM und Navigation fahrender Roboter, Hinderniskarten, Saugroboter-Prinzip. Direkt in Nav2 nutzbar.",hobby:"RPLidar A1/C1 sind die guenstigen 2D-Einsteiger und in ROS2 gut unterstuetzt. 3D-Lidar bleibt teuer.",tipp:["2D reicht fuer fahrende Roboter auf einer Ebene","Glas und Spiegel sind problematisch","In ROS2 als LaserScan direkt in slam_toolbox/Nav2"]},
{n:"Tiefenkamera (RGB-D)",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"RealSense, OAK-D",desc:"Kamera, die zusaetzlich zu Farbe die Entfernung pro Pixel liefert.",fkt:"Kombiniert ein normales Bild mit einer Tiefenkarte (per Stereo oder strukturiertem Licht). Damit lassen sich Objekte erkennen UND ihre Position im Raum bestimmen.",anw:"Objekterkennung und Greifen, 3D-Wahrnehmung, Navigation mit Hindernissen unterschiedlicher Hoehe. Bruecke zur KI-Wahrnehmung.",hobby:"Intel RealSense (D-Serie) und Luxonis OAK-D sind beliebt. OAK-D rechnet KI sogar on-board.",tipp:["Tiefe wird im hellen Sonnenlicht schlechter","Rechenlast hoch, oft Jetson statt Pi","Kalibrierung Kamera-zu-Roboter (Hand-Eye) noetig"]},
{n:"Kraft-/Drehmomentsensor",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"Wegzelle, FSR, F/T",desc:"Misst Kraft oder Drehmoment am Werkzeug oder Gelenk.",fkt:"Erfasst, wie stark der Roboter drueckt oder zieht. Ermoeglicht gefuehlvolles Greifen und Kollisionserkennung (Roboter merkt, wenn er gegen etwas stoesst).",anw:"Empfindliches Greifen, Einlernen durch Fuehren (der Mensch bewegt den Arm), sichere Mensch-Roboter-Naehe.",hobby:"Einfache FSR (Drucksensor) oder Wegzelle plus HX711-Verstaerker fuer den Einstieg. Echte 6-Achs-F/T-Sensoren sind teuer.",tipp:["Wegzelle + HX711 ist der guenstige Einstieg","Strombasierte Kraftschaetzung am Motor spart den Sensor","Echte F/T-Sensoren sprengen oft das Hobby-Budget"]},
{n:"Endschalter (Limit Switch)",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"mechanisch / optisch / Hall",desc:"Meldet, wenn eine Achse eine Endlage erreicht.",fkt:"Schaltet beim Erreichen eines Punktes (mechanisch durch Druck, optisch durch Unterbrechung, magnetisch durch Hall). Liefert eine eindeutige Referenzposition.",anw:"Referenzfahrt (Homing) bei Achsen ohne Absolut-Encoder, Schutz vor Ueberfahren der Grenzen. Kennst du aus den Druckern.",hobby:"Spottbillig und essenziell. Optische und Hall-Varianten sind verschleissfrei und praeziser als mechanische.",tipp:["Entprellen (Hardware oder Software)","Als Schutzgrenze zusaetzlich zum Soft-Limit","Homing gibt open-loop-Achsen ihren Nullpunkt"]},
{n:"Stromsensor (Motorstrom)",cat:"sensor",catL:"Sensor",bd:"b-green",spec:"INA219, ACS712",desc:"Misst den Strom, den ein Motor zieht.",fkt:"Der Motorstrom ist proportional zum Drehmoment. So laesst sich ohne extra Kraftsensor abschaetzen, wie stark der Motor arbeitet oder ob er blockiert.",anw:"Blockiererkennung, grobe Kraftschaetzung, Ueberlastschutz, Energiemonitoring.",hobby:"INA219 (per I2C, misst Strom und Spannung) ist bequem. Viele FOC-Treiber liefern den Strom ohnehin mit.",tipp:["Strom ist ein guenstiger Ersatz fuer einen Kraftsensor","Bei FOC oft schon vorhanden","Genauigkeit reicht fuer Schwellen, nicht fuer Feinkraft"]},

/* MECHANIK */
{n:"Getriebe (Untersetzung)",cat:"mechanik",catL:"Mechanik",bd:"b-brown",spec:"Verhaeltnis z.B. 1:20",desc:"Wandelt Drehzahl in Drehmoment (oder umgekehrt).",fkt:"Untersetzung (z.B. 1:20) macht den Antrieb 20x langsamer, aber rund 20x kraeftiger. Grundprinzip, um schwache schnelle Motoren nutzbar zu machen. Hat immer etwas Spiel (Backlash).",anw:"Fast jeder Roboterantrieb. Auswahl bestimmt, ob die Achse schnell oder kraeftig ist.",hobby:"Oft schon im Motor integriert. Planetengetriebe sind kompakt und kraeftig, Stirnradgetriebe guenstig.",tipp:["Backlash stoert bei Praezision, dann spielarme Getriebe","Hohe Untersetzung = mehr Kraft, weniger Tempo","Wirkungsgrad sinkt mit der Stufenzahl"]},
{n:"Zahnriemen + Pulley (GT2)",cat:"mechanik",catL:"Mechanik",bd:"b-brown",spec:"GT2, 6/9 mm breit",desc:"Formschluessige Riemenuebertragung ohne Schlupf.",fkt:"Ein gezahnter Riemen uebertraegt Bewegung praezise und schlupffrei zwischen zwei Zahnscheiben. Leise, guenstig, ideal fuer lineare Achsen und Fernantrieb.",anw:"X/Y-Achsen von Druckern und CNC, Antrieb entfernter Gelenke, Untersetzung ueber unterschiedliche Scheibengroessen. Kennst du aus deinen Druckern.",hobby:"GT2 ist der Maker-Standard. Spannung muss stimmen: zu lose verliert Schritte, zu straff belastet Lager.",tipp:["Riemenspannung richtig einstellen","Ueber Scheibengroessen leicht untersetzen","Nicht ueber scharfe Kanten fuehren"]},
{n:"Spindel (Trapez / Kugelumlauf)",cat:"mechanik",catL:"Mechanik",bd:"b-brown",spec:"T8 / Ballscrew",desc:"Wandelt Drehung in praezise Linearbewegung.",fkt:"Eine drehende Spindel schiebt eine Mutter linear. Trapezspindel (T8) ist guenstig und selbsthemmend (haelt Last ohne Strom), Kugelumlaufspindel laeuft leichter und spielarm, ist aber teurer.",anw:"Z-Achsen, Linearaktuatoren, praezise Vorschuebe, ueberall wo Kraft und Genauigkeit zaehlen.",hobby:"T8-Trapezspindel ist der guenstige Standard und gut fuer senkrechte Achsen (Selbsthemmung). Ballscrew fuer hohe Praezision.",tipp:["Selbsthemmung der Trapezspindel haelt senkrechte Lasten","Anti-Backlash-Mutter gegen Spiel","Steigung bestimmt Tempo vs Aufloesung"]},
{n:"Linearfuehrung",cat:"mechanik",catL:"Mechanik",bd:"b-brown",spec:"Rundwelle / Profilschiene / V-Slot",desc:"Fuehrt eine Achse exakt geradlinig.",fkt:"Nimmt Querkraefte auf, damit sich eine Achse nur in einer Richtung bewegt. Profilschiene (MGN) ist praezise und steif, Rundwelle guenstig, V-Slot-Rollen am Aluprofil ein Maker-Kompromiss.",anw:"Jede Linearachse braucht Fuehrung plus Antrieb (Spindel oder Riemen). Trennung von Fuehren und Antreiben.",hobby:"MGN-Profilschienen sind erschwinglich geworden und sehr beliebt. V-Slot ist guenstiger, aber weniger steif.",tipp:["Fuehrung traegt die Last, Antrieb nur die Bewegung","Profilschiene fuer Praezision, V-Slot fuers Budget","Sauber halten, Schmutz frisst die Laufflaeche"]},
{n:"Greifer (Gripper)",cat:"mechanik",catL:"Mechanik",bd:"b-brown",spec:"parallel / adaptiv / Sauger",desc:"Der Endeffektor zum Greifen von Objekten.",fkt:"Parallelgreifer schliessen zwei Backen (einfach, praezise), adaptive Greifer passen sich der Form an, Sauggreifer halten glatte Flaechen per Unterdruck. Wahl haengt stark vom Objekt ab.",anw:"Pick-and-Place, Manipulation, das greifende Ende fast jedes Arms.",hobby:"Parallelgreifer mit einem Servo ist der einfachste Eigenbau und gut druckbar. Saugnapf plus kleine Pumpe fuer glatte Teile.",tipp:["Greifer nach Objektform waehlen, nicht andersrum","Druckbare Designs gibt es viele fertig","Gummibelag auf den Backen erhoeht Halt"]},
{n:"Fahrwerk / Raeder",cat:"mechanik",catL:"Mechanik",bd:"b-brown",spec:"Differential / Mecanum / Omni",desc:"Antriebsart fahrender Roboter.",fkt:"Differentialantrieb (zwei angetriebene Raeder, dreht durch Tempo-Unterschied) ist einfach und robust. Mecanum- und Omni-Raeder erlauben seitliches Fahren und Drehen auf der Stelle, sind aber komplexer.",anw:"Mobile Roboter, Rover. Die Wahl bestimmt, wie der Roboter manoevriert und wie die Odometrie rechnet.",hobby:"Differential ist der ideale Einstieg (zwei Motoren plus Stuetzrad). Mecanum sieht beeindruckend aus, braucht aber vier geregelte Motoren.",tipp:["Differential fuer den Anfang, einfache Mathematik","Mecanum braucht vier praezise Antriebe","Radencoder fuer Odometrie einplanen"]},

/* COMPUTE */
{n:"Mikrocontroller (MCU)",cat:"compute",catL:"Compute",bd:"b-red",spec:"Arduino, ESP32, STM32, Pico",desc:"Kleiner Echtzeit-Rechner, der direkt mit Hardware spricht.",fkt:"Liest Sensoren und steuert Aktuatoren mit exaktem Timing (echtzeitnah). Hat kein vollwertiges Betriebssystem, dafuer praezise und stoersicher. Das Rueckgrat der untersten Steuerebene.",anw:"Motorregelung, Sensoreinlesen, schnelle Regelschleifen. Oft als Unterbau unter einem Raspberry Pi.",hobby:"ESP32 (WLAN/BLE, stark), RP2040/Pico (guenstig, zwei Kerne), STM32 (industrienah). micro-ROS bringt sogar ROS2 auf den MCU.",tipp:["MCU fuer Timing-kritisches, Pi fuer Denkarbeit","ESP32 wenn Funk gebraucht wird","micro-ROS verbindet MCU sauber mit ROS2"]},
{n:"Single-Board-Computer (SBC)",cat:"compute",catL:"Compute",bd:"b-red",spec:"Raspberry Pi 5",desc:"Vollwertiger Mini-Linux-Rechner fuer den Roboter.",fkt:"Laeuft Linux und damit ROS2, Kameras, Planung und Logik. Nicht echtzeithart, daher die schnelle Regelung lieber an einen MCU auslagern. Das Gehirn des Roboters.",anw:"ROS2-Knoten, Navigation, Bildverarbeitung, Koordination mehrerer Subsysteme.",hobby:"Raspberry Pi 5 ist der Standard. Genug fuer ROS2 und 2D-Navigation. Fuer schwere KI reicht er aber nicht.",tipp:["ROS2 (Jazzy) laeuft auf Ubuntu am saubersten","Schnelle Regelung auf MCU auslagern","Ordentliche, stabile Stromversorgung ist kritisch"]},
{n:"Edge-AI-Board (Jetson)",cat:"compute",catL:"Compute",bd:"b-red",spec:"Jetson Orin Nano",desc:"SBC mit GPU fuer KI direkt auf dem Roboter.",fkt:"Wie ein SBC, aber mit kraeftiger GPU fuer neuronale Netze. Erlaubt Objekterkennung, Tiefenkamera-Verarbeitung und gelernte Policies in Echtzeit am Roboter, ohne Cloud.",anw:"Vision-basiertes Greifen, gelernte Steuerung (Robot Learning auf dem Geraet), 3D-Wahrnehmung.",hobby:"Jetson Orin Nano ist der Einstieg in echte On-Robot-KI. Teurer und stromhungriger als ein Pi, aber notwendig fuer schwere Modelle.",tipp:["Erst noetig, wenn KI on-board laufen soll","Hoeherer Strombedarf einplanen","Fuer Training trotzdem ein PC mit dicker GPU"]},
];

/* ============================================================
   DATEN: STEUERUNG
   ============================================================ */
const STEU=[
{g:"signal",t:"PWM (Pulsweitenmodulation)",d:"Schnelles Ein- und Ausschalten mit variablem Tastverhaeltnis. Je laenger pro Takt eingeschaltet, desto mehr mittlere Leistung. So steuert man Motortempo und Servowinkel mit einem digitalen Pin.",p:"Servo: PWM-Pulsbreite codiert den Winkel. DC-Motor: PWM-Tastverhaeltnis codiert das Tempo."},
{g:"signal",t:"H-Bruecke",d:"Anordnung aus vier Schaltern, die einen Motor in beide Richtungen bestromen kann. Diagonale Paare schalten, je nach Drehrichtung. Beide oberen oder beiden unteren gleichzeitig waere ein Kurzschluss.",p:"Steckt in jedem DC-Motortreiber. Du gibst Richtung und PWM, die Bruecke macht den Rest."},
{g:"signal",t:"Mikroschritt",d:"Beim Stepper die Spulen nicht voll, sondern anteilig bestromen, sodass Zwischenpositionen entstehen. Erhoeht Aufloesung und Laufruhe, aber nicht das Drehmoment.",p:"TMC2209 mit 1/16 oder feiner laeuft seidig leise. Aufloesung steigt, Haltekraft pro Mikroschritt sinkt."},
{g:"signal",t:"Strombegrenzung (Vref)",d:"Schrittmotor-Treiber regeln den Spulenstrom auf einen eingestellten Wert (oft per Vref-Poti oder UART). Zu hoch heisst Hitze, zu niedrig heisst Schrittverlust.",p:"Der haeufigste Fehler bei neuen CNC/Druckerachsen. Strom passend zum Motordatenblatt setzen."},
{g:"signal",t:"Quadratur-Encoder-Auswertung",d:"Zwei um 90 Grad versetzte Signale (A und B) verraten nicht nur wie viel, sondern auch in welche Richtung sich die Welle dreht. Die Reihenfolge der Flanken codiert die Richtung.",p:"MCUs haben oft Hardware-Zaehler dafuer. Bei hoher Drehzahl Software-Polling vermeiden."},
{g:"regelung",t:"Offener vs geschlossener Regelkreis",d:"Offen: Kommando geben ohne Rueckmeldung (Stepper ohne Encoder). Geschlossen: Istwert messen, mit Sollwert vergleichen, Differenz ausregeln. Closed loop korrigiert Stoerungen selbst.",p:"Ein Servo ist intern closed loop. Ein nackter Schrittmotor ist open loop, bis ein Encoder dazukommt."},
{g:"regelung",t:"PID-Regler",d:"Der Standardregler. Er bildet die Stellgroesse aus drei Anteilen der Regelabweichung: P (proportional zum Fehler jetzt), I (Summe vergangener Fehler, gegen bleibende Abweichung) und D (Aenderungsrate, daempft Schwingen).",p:"Selbst bei Robot Learning oft die unterste Schicht. Tuning ist Handwerk: erst P, dann D, dann I."},
{g:"regelung",t:"P-, I-, D-Anteil im Detail",d:"P allein hinterlaesst oft eine bleibende Abweichung und neigt zum Schwingen. I baut diese Restabweichung ueber Zeit ab, kann aber ueberschwingen (Integral-Windup). D bremst schnelle Aenderungen und beruhigt, reagiert aber empfindlich auf Rauschen.",p:"Faustregel: P fuer Reaktion hochziehen bis es leicht schwingt, D dagegen, I nur wenn eine Restabweichung bleibt."},
{g:"regelung",t:"Feedforward",d:"Bekannten Aufwand vorab einrechnen, statt nur auf Fehler zu reagieren. Wenn man weiss, dass eine Last X Kraft braucht, gibt man die direkt vor und der PID muss nur noch kleine Reste korrigieren.",p:"Macht Bewegungen praeziser und schneller. In Motion-Controllern fuer Beschleunigung und Schwerkraft ueblich."},
{g:"regelung",t:"FOC (feldorientierte Regelung)",d:"Regelverfahren fuer buerstenlose Motoren, das Strom und Magnetfeld so ausrichtet, dass bei jeder Drehzahl maximales und gleichmaessiges Drehmoment entsteht. Braucht Encoder und etwas Rechenleistung.",p:"Grund, warum BLDC mit ODrive/VESC so sanft und kraeftig regeln. Im Hobby ueber SimpleFOC zugaenglich."},
{g:"regelung",t:"Trajektoriengenerierung",d:"Aus einem Ziel wird ein zeitlich sauberer Bewegungsverlauf mit begrenzter Geschwindigkeit und Beschleunigung (oft Trapez- oder S-Kurven-Profil). Verhindert Ruckeln und schont die Mechanik.",p:"Der Unterschied zwischen Roboter zuckt zum Ziel und Roboter faehrt geschmeidig hin."},
{g:"software",t:"ros2_control",d:"Das Standard-Framework in ROS2, um Hardware (Motoren, Encoder) einheitlich anzusteuern. Trennt Controller (Logik) von Hardware-Interface (Treiber). Tauscht man die Hardware, bleibt die Reglerlogik gleich.",p:"Lohnt sich, sobald du mehr als ein, zwei Motoren sauber regeln willst. Bringt fertige Controller-Typen mit."},
{g:"software",t:"Regelfrequenz / Loop Rate",d:"Wie oft pro Sekunde der Regelkreis laeuft (Hz). Zu langsam macht traege oder instabile Regelung, zu schnell verschwendet Rechenzeit. Muss konstant sein, Jitter ist Gift.",p:"Schnelle Schleifen (mehrere kHz, FOC) gehoeren auf den MCU. Planung darf langsamer (10-50 Hz) auf dem Pi laufen."},
{g:"software",t:"micro-ROS",d:"Bringt ROS2-Konzepte (Knoten, Topics) auf Mikrocontroller. Damit spricht ein ESP32 oder Teensy direkt die ROS2-Sprache, statt ueber eine selbstgebaute serielle Bruecke.",p:"Eleganter Weg, die schnelle MCU-Ebene und die ROS2-Ebene auf dem Pi sauber zu koppeln."},
];

/* ============================================================
   DATEN: SOFTWARE
   ============================================================ */
const SW=[
{n:"ROS2",cat:"framework",catL:"Framework",bd:"b-blue",typ:"Middleware",desc:"Das Standard-Framework, das alle Roboter-Bausteine als vernetzte Knoten verbindet.",was:"Kein Betriebssystem, sondern ein Baukasten aus Bibliotheken und Konventionen. Knoten (Programme) tauschen ueber Topics, Services und Actions Daten aus. Bringt Werkzeuge fuer Koordinaten (TF), Visualisierung (RViz) und Hardware (ros2_control) mit.",wann:"Sobald ein Projekt aus mehr als einem Programm besteht oder du fertige Bausteine (Navigation, Arm-Planung) nutzen willst. Der De-facto-Standard.",hobby:"Pflichtwissen, wenn du ueber Arduino-Niveau hinaus willst. Jazzy (LTS, Ubuntu 24.04) ist die richtige Version zum Lernen. Steile, aber lohnende Lernkurve.",hinweis:"Laeuft am saubersten auf Ubuntu. TF und das Build-System (colcon) sind die ersten Huerden."},
{n:"URDF",cat:"format",catL:"Format",bd:"b-gray",typ:"Beschreibung",desc:"XML-Format, das den Aufbau deines Roboters (Glieder, Gelenke, Masse, Form) beschreibt.",was:"Eine Datei, die ROS2 und den Simulatoren sagt, wie dein Roboter aussieht und sich bewegt: welche Links durch welche Joints verbunden sind, mit welchen Grenzen, Massen und Kollisionsformen.",wann:"Sobald du simulieren, visualisieren oder mit MoveIt2/Nav2 arbeiten willst. Die Grundlage, auf der vieles aufbaut.",hobby:"Etwas fummelig von Hand, aber zentral. Oft aus CAD (z.B. Fusion oder OnShape) exportierbar. Einmal richtig, ueberall nutzbar.",hinweis:"Fehler in der Kinematik-Kette aeussern sich als seltsam verbogene Roboter in RViz."},
{n:"Gazebo",cat:"sim",catL:"Simulator",bd:"b-green",typ:"Physik-Sim",desc:"Der ROS2-nahe Standardsimulator mit Physik und Sensormodellen.",was:"Simuliert deinen Roboter samt Physik (Schwerkraft, Reibung, Kollision) und simulierten Sensoren (Lidar, Kamera). Du testest komplette ROS2-Systeme, bevor echte Hardware existiert.",wann:"Zum Entwickeln und Testen von Navigation und Verhalten ohne Hardware-Risiko. Eng mit ROS2 verzahnt.",hobby:"Die praxisnahe Wahl fuer klassische Robotik. Fuer Kilted ist Gazebo Ionic empfohlen, Harmonic ist die LTS. Solider Allrounder.",hinweis:"Verwechslungsgefahr: das alte Gazebo Classic und das neue Gazebo (ehemals Ignition) sind verschieden."},
{n:"Webots",cat:"sim",catL:"Simulator",bd:"b-green",typ:"Physik-Sim",desc:"Eigenstaendiger, einsteigerfreundlicher Robotersimulator.",was:"Komplettes Simulationspaket mit vielen fertigen Robotermodellen und einfacher Bedienung. Funktioniert mit und ohne ROS2. Weniger Einrichtungsaufwand als Gazebo.",wann:"Wenn du schnell loslegen willst, ohne tief in die ROS2-Integration einzusteigen. Gut zum Lernen.",hobby:"Sehr zugaenglich, ideal zum Ausprobieren. Open Source. Etwas weniger ROS2-zentriert als Gazebo.",hinweis:"Fuer ROS2-Workflows ist Gazebo am Ende oft die natuerlichere Wahl."},
{n:"MoveIt2",cat:"lib",catL:"Bibliothek",bd:"b-purple",typ:"Arm-Planung",desc:"Das Standardpaket fuer Bewegungsplanung von Roboterarmen in ROS2.",was:"Loest inverse Kinematik, plant kollisionsfreie Bahnen und steuert den Arm zum Ziel. Du gibst eine Zielpose, MoveIt2 findet den Weg dorthin.",wann:"Fuer jeden Roboterarm, der mehr als feste Posen anfahren soll. Nimmt dir die schwere Kinematik-Mathematik ab.",hobby:"Genau das Werkzeug fuer deinen ersten 6-Achs-Arm. Braucht eine korrekte URDF und etwas Konfiguration.",hinweis:"Einrichtung ueber den Setup-Assistenten, aber TF und URDF muessen vorher stimmen."},
{n:"Nav2",cat:"lib",catL:"Bibliothek",bd:"b-purple",typ:"Navigation",desc:"Der Navigations-Stack fuer fahrende Roboter in ROS2.",was:"Bringt Kartierung, Lokalisierung, Pfadplanung und Hindernisvermeidung als fertiges Paket. Der Roboter faehrt selbststaendig von A nach B und weicht Hindernissen aus.",wann:"Fuer mobile Roboter und Rover, sobald sie autonom navigieren sollen. Arbeitet mit Lidar und Odometrie.",hobby:"Der direkte Weg zum eigenen kleinen Saugroboter-Prinzip. Setzt einen funktionierenden TF- und Odometrie-Aufbau voraus.",hinweis:"Viele Parameter zum Tunen. Erst mit sauberer Sensorik und TF beginnen."},
{n:"NVIDIA Isaac Sim",cat:"sim",catL:"Simulator",bd:"b-green",typ:"GPU-Sim",desc:"Fotorealistischer, GPU-beschleunigter Simulator fuer KI-Robotik.",was:"Hochwertige Physik und Grafik fuer Training gelernter Policies, synthetische Trainingsdaten und Sim-to-Real. Stark fuer Reinforcement Learning in grossem Massstab.",wann:"Wenn du ernsthaft in KI-Robotik und massives RL-Training einsteigst. Research- und Industrie-Tier.",hobby:"Erstmal ueberspringen. Braucht eine starke NVIDIA-GPU und ist deutlich komplexer als noetig fuer den Einstieg.",hinweis:"Beeindruckend, aber Overkill fuer die ersten Bau- und Steuerungsschritte."},
{n:"MuJoCo",cat:"sim",catL:"Simulator",bd:"b-green",typ:"Physik-Sim",desc:"Schnelle, praezise Physik-Engine, beliebt in der Forschung.",was:"Sehr akkurate und schnelle Simulation von Kontakten und Gelenken. Quasi-Standard fuer RL-Forschung an Lauf- und Greifrobotern. Inzwischen Open Source (Google DeepMind).",wann:"Fuer Robot-Learning-Forschung und RL-Experimente, wo Geschwindigkeit und Kontaktgenauigkeit zaehlen.",hobby:"Eher fuer den KI-Vertiefungsteil spaeter. Nicht noetig, um echte Hardware zu bauen und zu steuern.",hinweis:"Stark in der RL-Welt, aber kein klassischer Roboter-Bau-Simulator."},
{n:"Genesis",cat:"sim",catL:"Simulator",bd:"b-green",typ:"GPU-Sim",desc:"Neuere, extrem schnelle Simulationsplattform fuer Robot Learning.",was:"Hochperformante GPU-Simulation, die sehr viele parallele Umgebungen rechnet, um gelernte Policies schnell zu trainieren. Junges, schnell wachsendes Projekt.",wann:"Fuer fortgeschrittenes RL-Training mit hohem Durchsatz. Klar in der KI-Forschungs-Ecke.",hobby:"Definitiv erstmal ueberspringen. Interessant, wenn dich die KI-Seite spaeter tief packt.",hinweis:"Sehr neu, schnelllebig. Reift noch."},
{n:"Gymnasium",cat:"lib",catL:"Bibliothek",bd:"b-purple",typ:"RL-Umgebung",desc:"Standard-Schnittstelle fuer Reinforcement-Learning-Umgebungen.",was:"Definiert, wie eine RL-Umgebung mit dem lernenden Agenten spricht (Beobachtung, Aktion, Belohnung). Nachfolger von OpenAI Gym. Praktisch alle RL-Bibliotheken sprechen diese Schnittstelle.",wann:"Sobald du eigene RL-Aufgaben definierst oder Stable Baselines nutzt. Das gemeinsame Steckdosenformat der RL-Welt.",hobby:"Relevant erst im KI-Teil. Gut zu kennen, sobald RL dran ist.",hinweis:"Eine Schnittstelle, kein Simulator. Dahinter steckt immer eine echte Umgebung."},
{n:"RViz",cat:"tool",catL:"Werkzeug",bd:"b-teal",typ:"Visualisierung",desc:"Das 3D-Visualisierungswerkzeug von ROS2.",was:"Zeigt live, was dein Roboter denkt: Koordinatensysteme, Sensordaten, geplante Bahnen, Karten. Unverzichtbar zum Debuggen, weil man Fehler im TF oder in der Wahrnehmung sieht.",wann:"Praktisch immer parallel offen, wenn du an ROS2 arbeitest. Dein Fenster in den Roboter.",hobby:"Frueh lernen. Spart enorm Zeit beim Fehlersuchen. Kein Simulator, sondern eine Anzeige.",hinweis:"Zeigt nur, was ROS2 publiziert. Leeres RViz heisst oft fehlende TF oder Topics."},
];

/* ============================================================
   DATEN: ROBOT LEARNING
   ============================================================ */
const RL=[
{g:"paradigma",t:"Reinforcement Learning (RL)",d:"Der Roboter lernt durch Ausprobieren: er probiert Aktionen, bekommt Belohnung (Reward) fuer gutes Verhalten und passt seine Strategie an, um die Belohnung zu maximieren. Kein Vorzeigen noetig, aber sehr viele Versuche.",p:"Genau das Buch aus dem Post (Sutton und Barto) plus Stable Baselines 3 als Bibliothek. Training fast immer erst in Simulation."},
{g:"paradigma",t:"Imitation Learning / Behavior Cloning",d:"Der Roboter lernt, indem er menschliche Demonstrationen nachahmt. Du fuehrst die Bewegung vor (per Teleoperation), das Netz lernt, Beobachtung auf Aktion abzubilden. Schneller als RL, aber nur so gut wie die Demos.",p:"Das ist der LeRobot-Ansatz aus dem Post: Arm fuehren, Daten sammeln, Policy trainieren. Praktischster Einstieg in echtes Robot Learning."},
{g:"paradigma",t:"Policy",d:"Die gelernte Strategie selbst: eine Funktion (meist ein neuronales Netz), die aus der aktuellen Beobachtung die naechste Aktion ableitet. Das Endprodukt des Lernens, das auf dem Roboter laeuft.",p:"Eine trainierte Policy laeuft am Ende z.B. auf einem Jetson direkt am Arm."},
{g:"paradigma",t:"Reward (Belohnung)",d:"Das Signal, das dem RL-Agenten sagt, wie gut eine Aktion war. Reward-Design ist eine Kunst: schlecht gewaehlte Belohnung fuehrt zu cleverem, aber falschem Verhalten (Reward Hacking).",p:"In der Praxis steckt sehr viel Tuning im Reward. Falsche Belohnung heisst, der Roboter trickst statt loest."},
{g:"paradigma",t:"Vision-Language-Action (VLA)",d:"Neuere Modelle, die Bild und Sprachbefehl direkt in Roboteraktionen uebersetzen (nimm den roten Block fuehrt zur Bewegung). Bringen KI-Grundmodelle in die Robotik.",p:"Der aktuelle Forschungs-Hype. Ueber Hugging Face LeRobot werden solche Modelle zunehmend zugaenglich."},
{g:"sim2real",t:"Sim-to-Real Gap",d:"Eine in Simulation gelernte Policy versagt oft auf echter Hardware, weil Simulation nie exakt die Realitaet trifft (Reibung, Verzoegerung, Sensorrauschen). Diese Luecke zu schliessen ist die zentrale Huerde.",p:"Der Grund, warum Robot Learning aufwendiger ist als es in Demo-Videos aussieht."},
{g:"sim2real",t:"Domain Randomization",d:"Trick gegen die Sim-to-Real-Luecke: man variiert in der Simulation absichtlich Parameter (Massen, Reibung, Farben, Licht). Die Policy lernt robust zu sein und uebertraegt besser auf echte Hardware.",p:"Standardrezept beim Training in Isaac Sim oder MuJoCo, bevor es auf den echten Roboter geht."},
{g:"sim2real",t:"Teleoperation (Datensammlung)",d:"Den Roboter fernsteuern oder von Hand fuehren, um Trainingsdaten zu erzeugen. Beim Imitation Learning die Quelle der Demonstrationen. Oft mit einem zweiten, baugleichen Leader-Arm.",p:"Im LeRobot-Setup fuehrst du einen Leader-Arm, der Follower zeichnet auf. Daraus lernt die Policy."},
{g:"werkzeug",t:"Stable Baselines 3",d:"Saubere, gut dokumentierte Python-Bibliothek mit fertigen RL-Algorithmen (PPO, SAC und mehr). Der praktische Einstieg, um RL anzuwenden, ohne die Algorithmen selbst zu implementieren.",p:"Direkt aus dem Post. Mit Gymnasium kombiniert der schnellste Weg zu eigenem RL."},
{g:"werkzeug",t:"Hugging Face LeRobot",d:"Offene Plattform und Bibliothek fuer echtes Robot Learning auf erschwinglicher Hardware. Liefert Code, Datensaetze und vortrainierte Modelle, inklusive guenstiger Arm-Bauplaene (mit Feetech-Servos).",p:"Der Kern des Posts und dein realistischster Weg zu KI-gesteuerter Hardware. Arm nachbauen, Daten sammeln, Policy trainieren."},
{g:"werkzeug",t:"ACT / Diffusion Policy",d:"Zwei moderne Verfahren fuer Imitation Learning, die fluessige, praezise Manipulation aus wenigen Demonstrationen lernen. Haeufig in LeRobot-Projekten eingesetzt.",p:"Die Algorithmen hinter vielen beeindruckenden Greif-Demos der letzten Zeit."},
];

/* ============================================================
   DATEN: LERNPFAD (Ressourcen aus dem Post)
   ============================================================ */
const PFAD=[
{n:"Modern Robotics (Lynch & Park)",cat:"hardware",catL:"Hardware-nah",bd:"b-blue",typ:"Buch + Kurs",level:"Mittel",worum:"Kinematik, Dynamik, Bewegungsplanung und Regelung klassischer Roboter. Das Buch und die Northwestern-Coursera-Spezialisierung haben denselben Inhalt.",fuer:"Solider theoretischer Unterbau, wenn du verstehen willst, was MoveIt2 und Co. intern tun.",einordnung:"Sehr empfehlenswert als Theorie-Anker, aber mathelastig. Nicht zwingend zuerst, gut begleitend zum Bauen. Frei verfuegbar."},
{n:"Reinforcement Learning (Sutton & Barto)",cat:"ki",catL:"KI-nah",bd:"b-pink",typ:"Buch",level:"Mittel-Hoch",worum:"Das Standardwerk zu Reinforcement Learning. Von Grund auf, mit Theorie und Intuition. Frei als PDF verfuegbar.",fuer:"Wenn du die KI-Seite ernsthaft verstehen willst, nicht nur Bibliotheken bedienen.",einordnung:"Erst im KI-Teil relevant (Schritt 4). Gruendlich, aber kein Hardware-Stoff. Vorher lieber bauen und ROS2 lernen."},
{n:"DeepMind x UCL RL Lectures",cat:"ki",catL:"KI-nah",bd:"b-pink",typ:"Vorlesung",level:"Hoch",worum:"Videovorlesungsreihe zu Deep Learning und Reinforcement Learning von DeepMind und UCL. Kostenlos auf YouTube.",fuer:"Vertiefung der RL-Theorie parallel oder nach Sutton und Barto.",einordnung:"Anspruchsvoll und sehr KI-fokussiert. Klar im spaeteren Vertiefungsteil, nicht fuer den Bau-Einstieg."},
{n:"Computer Vision (Szeliski)",cat:"ki",catL:"KI-nah",bd:"b-pink",typ:"Buch",level:"Mittel-Hoch",worum:"Umfassendes Standardwerk zur Bildverarbeitung: Algorithmen und Anwendungen. Frei verfuegbar.",fuer:"Wenn dein Roboter sehen und Objekte erkennen soll (Tiefenkamera, Greifen nach Sicht).",einordnung:"Relevant, sobald Vision ins Spiel kommt. Eigenes grosses Feld, optional und themenabhaengig."},
{n:"State Estimation for Robotics (Barfoot)",cat:"ki",catL:"KI-nah",bd:"b-pink",typ:"Buch",level:"Hoch",worum:"Tiefe Mathematik der Zustandsschaetzung (Filter, Lie-Gruppen, Optimierung) fuer Lokalisierung und SLAM.",fuer:"Wer die Theorie hinter Sensorfusion und SLAM wirklich durchdringen will.",einordnung:"Graduate-Level und sehr mathematisch. Klar zum Ueberspringen am Anfang. Nur bei tiefem Interesse an SLAM-Theorie."},
{n:"ROS2 (offizielle Tutorials)",cat:"hardware",catL:"Hardware-nah",bd:"b-blue",typ:"Doku + Praxis",level:"Einstieg-Mittel",worum:"Die offiziellen ROS2-Tutorials (Jazzy) sind der strukturierte Weg ins Framework: Knoten, Topics, TF, eigene Pakete.",fuer:"Jeder, der ueber Mikrocontroller-Basteln hinaus echte Roboter-Software bauen will.",einordnung:"Kern deines Pfads (Schritt 2). Nicht aus dem Post, aber die wichtigste Ergaenzung. Mit Jazzy starten."},
{n:"Hugging Face LeRobot",cat:"ki",catL:"KI-nah",bd:"b-pink",typ:"Plattform + Kurs",level:"Mittel",worum:"Offene Plattform fuer echtes Robot Learning auf guenstiger Hardware, inklusive nachbaubarer Arm-Plaene mit Feetech-Servos und einem begleitenden Kurs.",fuer:"Der praktischste Brueckenschlag von gebauter Hardware zu gelernter KI-Steuerung.",einordnung:"Dein realistischstes KI-Ziel (Schritt 4). Verbindet beide Welten: erst Arm bauen, dann Policy lernen lassen."},
];

/* ============================================================
   DATEN: GLOSSAR
   ============================================================ */
const GLOSS=[
{g:"abk",t:"DOF",d:"Degrees of Freedom, Freiheitsgrade. Zahl unabhaengiger Bewegungsrichtungen, meist gleich der Zahl angetriebener Gelenke."},
{g:"abk",t:"IK / FK",d:"Inverse Kinematik (von Pose zu Gelenkwinkeln) und Vorwaertskinematik (Forward, von Gelenkwinkeln zu Pose)."},
{g:"abk",t:"TCP",d:"Tool Center Point, der gesteuerte Punkt am Werkzeugende des Roboters."},
{g:"abk",t:"IMU",d:"Inertial Measurement Unit. Sensor aus Gyroskop und Beschleunigungssensor, oft mit Magnetometer."},
{g:"abk",t:"ToF",d:"Time of Flight. Abstandsmessung ueber die Laufzeit eines Licht- oder Schallpulses."},
{g:"abk",t:"SLAM",d:"Simultaneous Localization and Mapping. Gleichzeitig Karte bauen und sich darin lokalisieren."},
{g:"abk",t:"PWM",d:"Pulse Width Modulation, Pulsweitenmodulation. Leistungssteuerung ueber das Ein-Aus-Verhaeltnis."},
{g:"abk",t:"PID",d:"Proportional-Integral-Differential-Regler. Der Standardregler aus drei Anteilen der Regelabweichung."},
{g:"abk",t:"FOC",d:"Field Oriented Control, feldorientierte Regelung fuer buerstenlose Motoren."},
{g:"abk",t:"ESC",d:"Electronic Speed Controller. Treiber fuer buerstenlose Motoren, klassisch fuer Drehzahl (Drohnen)."},
{g:"abk",t:"BLDC",d:"Brushless DC, buerstenloser Gleichstrommotor. Effizient und langlebig, braucht elektronische Kommutierung."},
{g:"abk",t:"SBC",d:"Single Board Computer, z.B. Raspberry Pi. Vollwertiger Mini-Linux-Rechner."},
{g:"abk",t:"MCU",d:"Microcontroller Unit. Kleiner Echtzeit-Chip fuer hardwarenahe, timing-kritische Aufgaben."},
{g:"abk",t:"RL",d:"Reinforcement Learning. Lernen durch Belohnung und Versuch."},
{g:"abk",t:"VLA",d:"Vision-Language-Action. Modelle, die Bild und Sprachbefehl direkt in Aktionen umsetzen."},
{g:"abk",t:"URDF",d:"Unified Robot Description Format. XML-Beschreibung des Roboteraufbaus fuer ROS2 und Simulatoren."},
{g:"abk",t:"TF",d:"Transform-System in ROS2. Verwaltet und rechnet zwischen Koordinatensystemen um."},
{g:"abk",t:"DDS",d:"Data Distribution Service. Das Kommunikations-Middleware unter ROS2, das die Knoten verbindet."},
{g:"abk",t:"LTS",d:"Long Term Support. Version mit langer Pflegezeit. Bei ROS2 ist Jazzy die aktuelle LTS."},
{g:"begriff",t:"Open loop / Closed loop",d:"Steuerung ohne bzw. mit Rueckmeldung. Closed loop misst den Istwert und regelt nach."},
{g:"begriff",t:"Odometrie",d:"Positionsschaetzung aus Bewegungsdaten (z.B. Raddrehungen). Driftet ueber die Zeit."},
{g:"begriff",t:"Pose",d:"Position plus Orientierung eines Objekts im Raum, zusammen 6 Werte."},
{g:"begriff",t:"Quaternion",d:"Vier-Werte-Darstellung der Orientierung ohne Gimbal-Lock, intern von ROS2 genutzt."},
{g:"begriff",t:"Backlash",d:"Spiel in Getriebe oder Verbindung, Leerweg bevor Bewegung uebertragen wird."},
{g:"begriff",t:"Singularitaet",d:"Gelenkstellung, in der der Arm einen Freiheitsgrad verliert und unkontrolliert schnell wird."},
{g:"begriff",t:"Policy",d:"Gelernte Strategie, die aus einer Beobachtung die naechste Aktion bestimmt."},
{g:"begriff",t:"Reward",d:"Belohnungssignal im Reinforcement Learning, Mass fuer die Qualitaet einer Aktion."},
{g:"begriff",t:"Sim-to-Real",d:"Uebertragung einer in Simulation gelernten Faehigkeit auf echte Hardware."},
{g:"begriff",t:"Domain Randomization",d:"Absichtliches Variieren von Sim-Parametern, um die Policy robust und uebertragbar zu machen."},
{g:"begriff",t:"Teleoperation",d:"Fernsteuern oder Fuehren des Roboters, oft zum Sammeln von Trainingsdaten."},
{g:"begriff",t:"Mikroschritt",d:"Anteilige Bestromung der Stepperspulen fuer feinere Aufloesung und ruhigeren Lauf."},
{g:"begriff",t:"Echtzeit",d:"Garantie, dass eine Berechnung in fester Zeit fertig wird. Wichtig fuer stabile Regelung."},
];

/* ============================================================
   RENDER: gruppierte Listen (Grundlagen, Steuerung, RL, Glossar)
   ============================================================ */
function renderList(cfg){
const q=document.getElementById(cfg.qid).value.toLowerCase();
let data=cfg.data.filter(x=>!q||x.t.toLowerCase().includes(q)||x.d.toLowerCase().includes(q)||(x.p||"").toLowerCase().includes(q));
document.getElementById(cfg.countid).textContent=data.length+" "+cfg.unit;
let html="";
cfg.groups.forEach(([k,l])=>{
const items=data.filter(x=>x.g===k);
if(!items.length)return;
html+=`<div class="gl-group"><div class="gl-gtitle">${esc(l)}</div>`;
items.forEach(x=>{
html+=`<div class="gl-item"><div class="gl-term">${esc(x.t)}</div><div class="gl-def">${esc(x.d)}</div>`;
if(x.p)html+=`<div class="gl-praxis"><b>Praxis:</b> ${esc(x.p)}</div>`;
html+=`</div>`;
});
html+=`</div>`;
});
document.getElementById(cfg.bodyid).innerHTML=html||'<div class="gl-def">Keine Treffer.</div>';
}

const cfgGrund={data:GRUND,qid:"gq-grund",countid:"gcount-grund",bodyid:"grund-body",unit:"Konzepte",groups:[["anatomie","Roboter-Anatomie"],["kinematik","Bewegung & Kinematik"],["wahrnehmung","Wahrnehmung & Navigation"],["architektur","Architektur & Prinzipien"]]};
const cfgSteu={data:STEU,qid:"gq-steu",countid:"gcount-steu",bodyid:"steu-body",unit:"Konzepte",groups:[["signal","Signale & Ansteuerung"],["regelung","Regelung"],["software","Software-Steuerebene"]]};
const cfgRL={data:RL,qid:"gq-rl",countid:"gcount-rl",bodyid:"rl-body",unit:"Eintraege",groups:[["paradigma","Lernparadigmen"],["sim2real","Sim-to-Real"],["werkzeug","Werkzeuge & Bibliotheken"]]};
const cfgGloss={data:GLOSS,qid:"gq-gloss",countid:"gcount-gloss",bodyid:"gloss-body",unit:"Begriffe",groups:[["abk","Abkuerzungen"],["begriff","Begriffe"]]};

document.getElementById("gq-grund").addEventListener("input",()=>renderList(cfgGrund));
document.getElementById("gq-steu").addEventListener("input",()=>renderList(cfgSteu));
document.getElementById("gq-rl").addEventListener("input",()=>renderList(cfgRL));
document.getElementById("gq-gloss").addEventListener("input",()=>renderList(cfgGloss));
renderList(cfgGrund);renderList(cfgSteu);renderList(cfgRL);renderList(cfgGloss);

/* ============================================================
   RENDER: Tabellen (Hardware, Software, Lernpfad)
   ============================================================ */
function makeTable(cfg){
let state={cat:"all",col:cfg.cols[0].k,dir:1,exp:null};
const catDiv=document.getElementById(cfg.catsid);
cfg.cats.forEach(c=>{const b=document.createElement("button");b.textContent=c.l;b.className=c.k==="all"?"active":"";b.onclick=()=>{state.cat=c.k;catDiv.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()};catDiv.appendChild(b)});
function render(){
const q=document.getElementById(cfg.qid).value.toLowerCase();
let data=cfg.data.filter(f=>(state.cat==="all"||f.cat===state.cat)&&(!q||cfg.search(f).toLowerCase().includes(q)));
data.sort((a,b)=>state.dir*String(a[state.col]||"").localeCompare(String(b[state.col]||""),"de"));
document.getElementById(cfg.countid).textContent=data.length+" "+cfg.unit;
let th="<tr>"+cfg.cols.map(c=>`<th data-k="${c.k}">${esc(c.l)}<span class="ar">${state.col===c.k?(state.dir===1?"\u25b2":"\u25bc"):""}</span></th>`).join("")+"</tr>";
document.getElementById(cfg.theadid).innerHTML=th;
document.querySelectorAll("#"+cfg.theadid+" th").forEach(t=>t.onclick=()=>{const k=t.dataset.k;if(state.col===k)state.dir*=-1;else{state.col=k;state.dir=1}render()});
let tb="";
data.forEach(f=>{
const key=f.n;
tb+=`<tr style="cursor:pointer" data-n="${esc(key)}">`;
cfg.cols.forEach(c=>{tb+=cfg.cell(f,c.k)});
tb+="</tr>";
if(state.exp===key){tb+=`<tr class="dr"><td colspan="${cfg.cols.length}">${cfg.detail(f)}</td></tr>`}
});
const tbody=document.getElementById(cfg.tbodyid);
tbody.innerHTML=tb;
tbody.querySelectorAll("tr[data-n]").forEach(r=>r.onclick=()=>{const n=r.dataset.n;state.exp=state.exp===n?null:n;render()});
}
document.getElementById(cfg.qid).addEventListener("input",render);
render();
}

/* ---- Hardware ---- */
makeTable({
data:HW,qid:"q-hw",catsid:"cats-hw",countid:"count-hw",theadid:"thead-hw",tbodyid:"tbody-hw",unit:"Bauteile",
cats:[{k:"all",l:"Alle"},{k:"aktuator",l:"Aktuatoren"},{k:"treiber",l:"Treiber"},{k:"power",l:"Energie"},{k:"sensor",l:"Sensoren"},{k:"mechanik",l:"Mechanik"},{k:"compute",l:"Compute"}],
cols:[{k:"n",l:"Bauteil"},{k:"catL",l:"Kategorie"},{k:"spec",l:"Typisch"},{k:"desc",l:"Kurzbeschreibung"}],
search:f=>f.n+" "+f.desc+" "+f.fkt+" "+f.spec+" "+f.anw,
cell:(f,k)=>{
if(k==="catL")return `<td><span class="bd ${f.bd}">${esc(f.catL)}</span></td>`;
if(k==="n")return `<td class="nm">${esc(f.n)}</td>`;
if(k==="spec")return `<td class="spec">${esc(f.spec||"-")}</td>`;
if(k==="desc")return `<td class="desc-cell">${esc(f.desc)}</td>`;
return `<td>${esc(f[k]||"")}</td>`;
},
detail:f=>{
let h=`<strong>${esc(f.n)}</strong><div class="meta"><span><b>Kategorie:</b> ${esc(f.catL)}</span><span><b>Typisch:</b> ${esc(f.spec||"-")}</span></div>`;
h+=`<div class="block"><div class="blk-title">Was es bringt</div><div class="blk-body">${esc(f.fkt)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Im Roboter</div><div class="blk-body">${esc(f.anw)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Im Hobby / Auswahl</div><div class="blk-body">${esc(f.hobby)}</div></div>`;
if(f.tipp&&f.tipp.length)h+=`<div class="block"><div class="blk-title">Tipps & Stolpersteine</div><div class="uc-list">${f.tipp.map(u=>"\u2022 "+esc(u)).join("<br>")}</div></div>`;
return h;
}
});

/* ---- Software ---- */
makeTable({
data:SW,qid:"q-sw",catsid:"cats-sw",countid:"count-sw",theadid:"thead-sw",tbodyid:"tbody-sw",unit:"Tools",
cats:[{k:"all",l:"Alle"},{k:"framework",l:"Framework"},{k:"lib",l:"Bibliotheken"},{k:"sim",l:"Simulatoren"},{k:"tool",l:"Werkzeuge"},{k:"format",l:"Formate"}],
cols:[{k:"n",l:"Tool"},{k:"catL",l:"Kategorie"},{k:"typ",l:"Typ"},{k:"desc",l:"Kurzbeschreibung"}],
search:f=>f.n+" "+f.desc+" "+f.was+" "+f.wann+" "+f.typ,
cell:(f,k)=>{
if(k==="catL")return `<td><span class="bd ${f.bd}">${esc(f.catL)}</span></td>`;
if(k==="n")return `<td class="nm">${esc(f.n)}</td>`;
if(k==="typ")return `<td class="spec">${esc(f.typ)}</td>`;
if(k==="desc")return `<td class="desc-cell">${esc(f.desc)}</td>`;
return `<td>${esc(f[k]||"")}</td>`;
},
detail:f=>{
let h=`<strong>${esc(f.n)}</strong><div class="meta"><span><b>Kategorie:</b> ${esc(f.catL)}</span><span><b>Typ:</b> ${esc(f.typ)}</span></div>`;
h+=`<div class="block"><div class="blk-title">Was es ist</div><div class="blk-body">${esc(f.was)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Wann nutzen</div><div class="blk-body">${esc(f.wann)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Im Hobby</div><div class="blk-body">${esc(f.hobby)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Hinweis</div><div class="blk-body">${esc(f.hinweis)}</div></div>`;
return h;
}
});

/* ---- Lernpfad ---- */
makeTable({
data:PFAD,qid:"q-pfad",catsid:"cats-pfad",countid:"count-pfad",theadid:"thead-pfad",tbodyid:"tbody-pfad",unit:"Ressourcen",
cats:[{k:"all",l:"Alle"},{k:"hardware",l:"Hardware-nah"},{k:"ki",l:"KI-nah"}],
cols:[{k:"n",l:"Ressource"},{k:"catL",l:"Fokus"},{k:"typ",l:"Typ"},{k:"level",l:"Level"},{k:"worum",l:"Worum geht es"}],
search:f=>f.n+" "+f.worum+" "+f.fuer+" "+f.einordnung+" "+f.typ,
cell:(f,k)=>{
if(k==="catL")return `<td><span class="bd ${f.bd}">${esc(f.catL)}</span></td>`;
if(k==="n")return `<td class="nm">${esc(f.n)}</td>`;
if(k==="typ")return `<td class="spec">${esc(f.typ)}</td>`;
if(k==="level")return `<td class="spec">${esc(f.level)}</td>`;
if(k==="worum")return `<td class="desc-cell">${esc(f.worum)}</td>`;
return `<td>${esc(f[k]||"")}</td>`;
},
detail:f=>{
let h=`<strong>${esc(f.n)}</strong><div class="meta"><span><b>Fokus:</b> ${esc(f.catL)}</span><span><b>Typ:</b> ${esc(f.typ)}</span><span><b>Level:</b> ${esc(f.level)}</span></div>`;
h+=`<div class="block"><div class="blk-title">Worum geht es</div><div class="blk-body">${esc(f.worum)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Fuer wen</div><div class="blk-body">${esc(f.fuer)}</div></div>`;
h+=`<div class="block"><div class="blk-title">Einordnung</div><div class="blk-body">${esc(f.einordnung)}</div></div>`;
return h;
}
});
