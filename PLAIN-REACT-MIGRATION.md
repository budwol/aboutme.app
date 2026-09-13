# Plain React Migration

Fortschritt: `[--------------------]` 0% (0 von 5 Phasen abgeschlossen)

Status: **geplant**. Dieses Dokument beschreibt den nächsten Migrationspfad
nach dem Release `1.4.0`. Es wird noch keine Migration umgesetzt.

## Ziel

Die statische PWA läuft mit plain React, React DOM und Browser-APIs. Expo,
React Native, React Native Web und native-orientierte Hilfsbibliotheken sind
aus dem Produktionspfad entfernt. Inhalte, Accessibility, Deep Links,
Navigationstransitions, Background-Image, Offline-Verhalten und die bestehende
`noindex`-Policy bleiben erhalten.

## Leitplanken

- `react` und `react-dom` bleiben die einzigen UI-Runtime-Grundlagen.
- Semantisches HTML, CSS und Browser-APIs ersetzen React-Native-Primitives.
- Die Migration erfolgt phasenweise mit grünen Unit-, Integrations- und E2E-
  Regressionstests vor jedem nächsten Schritt.
- Jede entfernte Dependency muss vorher produktionsweit gesucht und danach mit
  `npm ls`, Bundle-Gates und einem Clean-Export geprüft werden.
- `noindex, nofollow` bleibt unverändert und darf nicht zur Lighthouse-
  Optimierung aktiviert werden.
- Versionierung und Release-Tags bleiben unverändert bis zum Abschluss eines
  geprüften Migrationsschritts.

## Dependency-Zielbild

| Dependency                 | Ziel      | Voraussetzung                                       |
| -------------------------- | --------- | --------------------------------------------------- |
| `react-native`             | entfernen | keine Runtime- oder Test-Imports mehr               |
| `react-native-web`         | entfernen | alle UI-Primitives sind DOM/CSS                     |
| `react-native-logs`        | entfernen | Browser-Logger mit gleicher API und Tests           |
| `@react-navigation/drawer` | entfernen | Web-Drawer und Tastaturbedienung fertig             |
| `@react-navigation/native` | entfernen | keine Navigation-Container-/Action-Imports mehr     |
| `expo-router`              | entfernen | statische Route-Auflösung und Deep Links abgedeckt  |
| `expo`                     | entfernen | Expo-Export, Config und Runtime vollständig ersetzt |

## Phasen

### 1. Browser-Foundation

Status: **geplant**

- Gemeinsame DOM-Komponenten und CSS-Layoutgrenzen festlegen.
- Web-Entry, Hydration, Static Shell und Error Boundary auf React DOM
  ausrichten.
- Browser-Tests für Scrollen, Focus, Pointer, Keyboard und Reduced Motion
  ergänzen.
- Keine Dependency entfernen, solange der neue Entry nicht parallel validiert
  werden kann.

Exit-Kriterium: Die wichtigsten Screens rendern im neuen React-DOM-Entry mit
identischem Inhalt und identischem visuellen Verhalten.

### 2. Web-Navigation

Status: **geplant**

- Statische Route-Tabelle und Sprachpfade definieren.
- Drawer, Links, Back/Forward, Deep Links und 404-Fallback auf Web-Navigation
  umstellen.
- Navigationstransition mit altem und neuem Content sowie Background-Layer
  regressionssicher testen.
- Danach `@react-navigation/drawer` und `@react-navigation/native` entfernen.

Exit-Kriterium: Alle vorhandenen Routen und Navigationseinstiege funktionieren
per Mouse, Touch, Tastatur, Browser-History und direktem URL-Aufruf.

### 3. Browser-Services

Status: **geplant**

- `react-native-logs` durch einen kleinen Browser-Logger ersetzen.
- Linking, Theme-Persistenz, Viewport und Asset-Auflösung ausschließlich über
  Browser-Adapter betreiben.
- Sicherheits-, Error- und Production-Logging testen.

Exit-Kriterium: Kein produktiver Import aus `react-native-logs` oder einem
Native-Service-Adapter.

### 4. Expo-Ablösung

Status: **geplant**

- Static Export durch einen React-DOM-kompatiblen Build ersetzen.
- Manifest, Service Worker, Offline-Fallback, PDF-Generierung und Nginx-
  Ausgabe als eigenständige Build-Schritte behalten.
- `expo-router` und `expo` erst nach erfolgreicher Route- und Export-
  Regression entfernen.

Exit-Kriterium: Clean-Runner-Build ohne Expo, mit unverändertem PWA-Verhalten,
`noindex` und vollständigen Export-Gates.

### 5. Dependency- und Release-Cleanup

Status: **geplant**

- `react-native`, `react-native-web` und verbliebene transitive Native-Pakete
  mit `npm ls` und Bundle-Analyse verifizieren.
- Unused-Imports, Test-Utilities, Konfiguration und Dokumentation entfernen.
- Coverage bei 100% für Statements, Branches, Functions und Lines halten.
- Lighthouse, Accessibility, Bundle-Größe und E2E auf einem Clean Runner
  erneut messen.

Exit-Kriterium: `npm ls` enthält keine nicht begründeten Native-/Expo-Pakete,
der Produktions-Bundle enthält keine Native-Runtime-Marker und die komplette
Release-Pipeline ist reproduzierbar grün.

## Validierung je Phase

```text
npm run test:prettier
npm run lint
npm run test:types
npm run test:circular
npm run test:unit
npm run test:coverage
npm run test:integration
npm run test:smoke
npm run test:e2e
npm run test:deps
```

Ein Migrationsschritt gilt erst als abgeschlossen, wenn seine Exit-Kriterien
erfüllt, die Ergebnisse hier dokumentiert und die Änderungen committed sind.

## Fortschrittsprotokoll

| Datum      | Phase | Änderung                                                     | Validierung                                            |
| ---------- | ----- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 2026-09-13 | -     | Migrationspfad für Plain React nach Release `1.4.0` angelegt | Noch keine Implementierung; Ausgangsstand festgehalten |
