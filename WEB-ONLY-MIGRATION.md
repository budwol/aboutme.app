# Web-Only PWA Migration

## Ziel

Die Anwendung wird als statische, installierbare Web-PWA betrieben. Native
Rendering- und Navigationsabstraktionen werden entfernt. Verhalten, Inhalte,
Barrierefreiheit, Background-Image, Navigationstransitions und SEO-Policy
bleiben erhalten. Die bestehende `noindex`-Policy ist beabsichtigt und darf
nicht aktiviert werden.

## Leitplanken

- Web-Plattform und Browser-APIs sind die primäre Laufzeit.
- Semantisches HTML und CSS ersetzen React-Native-Layout-Primitives.
- CSS-Transitions oder Web Animations ersetzen Reanimated.
- `srcset`/`picture` ersetzen die plattformübergreifende Bildauflösung.
- Routing wird erst nach Stabilisierung der Web-Shell ausgetauscht.
- Jede Phase benötigt fokussierte Unit-, Integrations- und E2E-Regressionstests.
- Nach jeder Phase werden Lighthouse, Bundle-Größe, Accessibility und
  Navigationstransitions erneut gemessen.

## Phasen

### 0. Bestand und Messbaseline

Status: **abgeschlossen**

- Lighthouse-Report analysiert: Performance 94, Accessibility 100,
  Best Practices 100, SEO 66.
- `noindex` und deaktivierte Produktions-Source-Maps als beabsichtigte Policy
  bestätigt.
- Temporärer Source-Map-Export zur Bundle-Analyse durchgeführt.
- Größte Quellanteile identifiziert: `react-native-web`, Reanimated,
  React-DOM, Expo Router, Gesture Handler und `sanitize-html`.

### 1. Web-Shell und Asset-Grenze

Status: **in Arbeit**

- [x] Responsive Avatar-Auslieferung um die `384px`-Variante erweitert.
- [x] E2E-Setup-Abhängigkeit ImageMagick in CI explizit installiert.
- [x] Web-native Asset-Komponente mit `<img>`, `srcset`, `sizes`, `loading` und
      `fetchpriority` einführen.
- [x] `expo-image` aus dem produktiven Bildpfad und den Dependencies entfernen.
- [x] Verschachtelte React-Native-Styles vor dem DOM-Rendern rekursiv flatten.
- [x] Tooltip-Positionierung und Typografie in eine getestete Web-kompatible
      Komponente überführen.
- [x] Tooltip-Fade und Sprechblasen-Spitze ohne Layout-Regression ergänzen.
- [ ] Background-Image und Navigationstransition in der neuen Asset-Grenze
      regressionssicher abdecken.
- [x] Web-Shell ohne React-Native-Image- und Gradient-Abhängigkeiten ausliefern.

Exit-Kriterium: Kein initialer Bild- oder Font-Fehler, unverändertes weiches
Ein-/Ausfaden, alle lokalen Requests erfolgreich, Lighthouse-Image-Audit ohne
unnötige Avatar-Übertragung.

### 2. Präsentationsprimitive

Status: **offen**

- [ ] `View`, `Text`, `Pressable`, `FlatList` und `StyleSheet` in semantische
      Web-Komponenten und CSS überführen.
- [ ] Fokusführung, Tastaturbedienung, ARIA-Zustände und reduzierte Bewegung
      erhalten beziehungsweise vervollständigen.
- [ ] Native-only Fallbacks aus produktiven Web-Pfaden entfernen.

Exit-Kriterium: Keine produktiven UI-Imports aus `react-native` oder
`react-native-web`; Accessibility- und Responsive-E2E-Suite bleibt grün.

### 3. Navigation und Interaktion

Status: **offen**

- [ ] Drawer durch Web-Navigation mit `nav`, Links, Dialogzuständen und
      CSS-Animation ersetzen.
- [ ] `react-native-gesture-handler` und `@react-navigation/drawer` entfernen.
- [ ] Routing-Entscheidung anhand Bundle-Größe, Deep Links, Back-Navigation und
      statischem Export treffen.
- [ ] Expo Router nur entfernen, wenn alle Routen, Sprachpfade und 404-Fälle
      gleichwertig abgedeckt sind.

Exit-Kriterium: Deep Links, Back/Forward, mobile Navigation, Tastatur und
Transition-Background funktionieren in allen unterstützten Viewports.

### 4. Animationen, Effekte und Plattform-Dependencies

Status: **offen**

- [ ] Reanimated durch CSS/Web Animations ersetzen.
- [x] `expo-linear-gradient` durch CSS ersetzen.
- [x] `expo-blur` durch CSS `backdrop-filter` ersetzen.
- [x] `react-native-popable` aus dem Web-Pfad entfernen.
- [x] `expo-image` vollständig entfernen.
- [ ] `expo-application`, `expo-constants`, `expo-localization` und Linking-
      Sonderpfade durch Web-APIs oder kleine lokale Adapter ersetzen.

Exit-Kriterium: Relevante Expo-/Native-Dependencies sind aus dem Web-Bundle
und aus `package.json` entfernt; Motion- und Theme-Tests decken die Browserpfade
ab.

### 5. Sanitizing, Bundle und PWA-Finalisierung

Status: **offen**

- [ ] Prüfen, ob `sanitize-html` durch eine kleinere, gleichwertig sichere
      Web-Lösung ersetzt oder nur auf Inhaltsseiten geladen werden kann.
- [ ] Bundle-Splitting beziehungsweise routebezogenes Laden messen und nur bei
      stabiler Navigation übernehmen.
- [ ] Manifest, Service Worker, Offline-Fallback, Cache-Strategie und Install-
      Verhalten abschließend prüfen.
- [ ] Lighthouse-Baseline aktualisieren; `noindex` bleibt unverändert.

Exit-Kriterium: Reproduzierbarer Clean-Runner-Build, vollständige Testpipeline,
keine Browser-/Request-Fehler und dokumentierte Bundle-/Lighthouse-Werte.

## Umsetzungsstand

| Datum      | Phase | Änderung                                                | Validierung                                               |
| ---------- | ----- | ------------------------------------------------------- | --------------------------------------------------------- |
| 2026-09-13 | 0/1   | Bundle analysiert, 384px-Avatar ergänzt                 | 469 Unit-Tests, Lint, TypeScript und Prettier erfolgreich |
| 2026-09-13 | 1     | ImageMagick als explizite CI-Abhängigkeit ergänzt       | E2E-Artefakt analysiert; fehlendes `convert` behoben      |
| 2026-09-13 | 1     | `expo-image` durch Web-`<img>` mit `srcset` ersetzt     | Web-Export erfolgreich; Bundle ohne `expo-image`-Referenz |
| 2026-09-13 | 1     | DOM-Style-Regression behoben                            | 470 Unit-Tests, Lint und TypeScript erfolgreich           |
| 2026-09-13 | 1/4   | CSS-Tooltip mit Fade und Sprechblasen-Spitze eingeführt | 18 Tooltip-Tests, Lint und TypeScript erfolgreich         |
| 2026-09-13 | 4     | CSS-Blur auf 8px begrenzt und Dark-Overlay korrigiert   | 484 Unit-Tests, Lint und TypeScript erfolgreich           |

Bei jeder Migrationserweiterung wird diese Tabelle ergänzt und der Status der
betroffenen Phase aktualisiert.
