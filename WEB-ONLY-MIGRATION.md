# Web-Only PWA Migration

Fortschritt: `[#################---] 86%` (24 von 28 Arbeitspaketen)

Statuswerte: **abgeschlossen** = Exit-Kriterien erfüllt, **in Arbeit** = Phase
aktiv mit offenen Arbeitspaketen, **geplant** = noch nicht begonnen.

Aktueller Fokus: Phase 2 mit verbleibenden Native-UI-Primitives abschließen,
danach den Drawer in Phase 3 durch Web-Navigation ersetzen. Erst dann können
die transitiven Router-/Drawer-Dependencies entfernt werden.
Neue Phasen werden erst begonnen, wenn die jeweils aktiven Exit-Kriterien erfüllt
sind.

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
- `expo-constants` und `expo-linking` bleiben bis zur Expo-Router-Ablösung als
  direkte Peer-Dependencies installiert; der eigene Code nutzt den Browser-
  Adapter.
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

Status: **in Arbeit**

- [ ] `View`, `Text`, `Pressable`, `FlatList` und `StyleSheet` in semantische
      Web-Komponenten und CSS überführen.
- [ ] Fokusführung, Tastaturbedienung, ARIA-Zustände und reduzierte Bewegung
      erhalten beziehungsweise vervollständigen.
- [ ] Native-only Fallbacks aus produktiven Web-Pfaden entfernen.
- [x] `SafeAreaView` durch einen Web-Container mit CSS-Safe-Area-Insets ersetzen.
- [x] Statische Navigationslisten von `FlatList` auf `ScrollView` mit stabilen
      Keys und Separatoren umstellen.
- [x] Die statische Portrait-Projektliste von `FlatList` auf `ScrollView` mit
      stabilen Keys und unverändertem Scroll-Callback umstellen.
- [x] `GestureHandlerRootView` aus dem Web-Root-Layout entfernen.
- [x] Resize-Events im App-Frame über `window.resize` statt Native-
      `Dimensions` abonnieren.

Exit-Kriterium: Keine produktiven UI-Imports aus `react-native` oder
`react-native-web`; Accessibility- und Responsive-E2E-Suite bleibt grün.

### 3. Navigation und Interaktion

Status: **geplant**

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

Status: **in Arbeit**

- [x] Reanimated vollständig durch CSS/Web Animations ersetzen.
- [x] Hero-Shape-Bewegung durch CSS-Keyframes mit Reduced-Motion-Regel ersetzen.
- [x] Experience-Detailbox durch CSS-Höhen-Transition ersetzen.
- [x] Header-Busy-Fade durch CSS-Opacity-Transition ersetzen.
- [x] Busy-Overlay der Base-Screens durch CSS-Opacity-Transition ersetzen.
- [x] Scroll-State, Header-Shadow und Header-Blur auf Web-State umstellen.
- [x] Intro-, Content- und Navigationstransition in `WnaApp` auf CSS umstellen.
- [x] `expo-linear-gradient` durch CSS ersetzen.
- [x] `expo-blur` durch CSS `backdrop-filter` ersetzen.
- [x] `react-native-popable` aus dem Web-Pfad entfernen.
- [x] `expo-image` vollständig entfernen.
- [x] Linking-Sonderpfade durch einen getesteten Browser-Adapter ersetzen.
- [x] `expo-application` und `expo-constants` durch die zentrale
      `package.json`-Versionsquelle ersetzen.
- [x] `expo-localization` durch Browser-Locale-APIs ersetzen.
- [x] Direkte `react-native-worklets`-Dependency entfernen; transitiver Bezug
      bleibt bis zur Navigation-Migration bestehen.
- [x] Direkte `react-native-screens`-Dependency entfernen; transitiver Bezug
      bleibt bis zur Expo-Router-Migration bestehen.

Exit-Kriterium: Relevante Expo-/Native-Dependencies sind aus dem Web-Bundle
und aus `package.json` entfernt; Motion- und Theme-Tests decken die Browserpfade
ab.

### 5. Sanitizing, Bundle und PWA-Finalisierung

Status: **geplant**

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

| Datum      | Phase | Änderung                                                               | Validierung                                                    |
| ---------- | ----- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| 2026-09-13 | 0     | Bundle analysiert, 384px-Avatar ergänzt                                | 469 Unit-Tests, Lint, TypeScript und Prettier erfolgreich      |
| 2026-09-13 | 1     | ImageMagick als explizite CI-Abhängigkeit ergänzt                      | E2E-Artefakt analysiert; fehlendes `convert` behoben           |
| 2026-09-13 | 1     | `expo-image` durch Web-`<img>` mit `srcset` ersetzt                    | Web-Export erfolgreich; Bundle ohne `expo-image`-Referenz      |
| 2026-09-13 | 1     | DOM-Style-Regression behoben                                           | 470 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 1     | CSS-Tooltip mit Fade und Sprechblasen-Spitze eingeführt                | 18 Tooltip-Tests, Lint und TypeScript erfolgreich              |
| 2026-09-13 | 4     | CSS-Blur auf 8px begrenzt und Dark-Overlay korrigiert                  | 484 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | `expo-localization` durch Browser-Locale ersetzt                       | 484 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Native Versions-Dependencies entfernt                                  | 483 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Linking durch Browser-Adapter ersetzt                                  | 54 fokussierte Tests, Lint und TypeScript erfolgreich          |
| 2026-09-13 | 4     | Verwaistes `expo-web-browser` und alte Localization-Config entfernt    | 491 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Neuer Lighthouse-Messpunkt nach Dependency-Cleanup                     | Performance 95, LCP 882 ms, 705.9 kB Transfer, 7 Requests      |
| 2026-09-13 | 4     | `WnaAccentBar` von Reanimated auf CSS-Animation umgestellt             | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Hero-Shape-Bewegung auf CSS-Keyframes umgestellt                       | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Experience-Detailbox auf CSS-Höhen-Transition umgestellt               | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Header-Busy-Fade auf CSS-Opacity-Transition umgestellt                 | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Busy-Overlay auf CSS-Opacity-Transition umgestellt                     | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Scroll-State und Header-Styles auf Web-State umgestellt                | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Intro-, Content- und Navigationstransition auf CSS umgestellt          | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | `react-native-reanimated` aus dem Web-Pfad und package.json entfernt   | 497 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 4     | Hero-Kreisbewegung und Profil-Bar mit festen Web-Keyframes abgesichert | 500 Unit-Tests, 100% Coverage, Lint und TypeScript erfolgreich |
| 2026-09-13 | 4     | Direkte `react-native-worklets`-Dependency entfernt                    | Transitiver Bezug über Drawer-Navigation dokumentiert          |
| 2026-09-13 | 2     | `SafeAreaView` durch CSS-Safe-Area-Insets ersetzt                      | 500 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 2     | `GestureHandlerRootView` aus dem Web-Root-Layout entfernt              | 500 Unit-Tests, Lint und TypeScript erfolgreich                |
| 2026-09-13 | 2     | App-Resize auf `window.resize` umgestellt                              | 501 Unit-Tests, 100% Coverage, Lint und TypeScript erfolgreich |
| 2026-09-13 | 3     | Native Dependencies auf direkte und transitive Nutzung geprüft         | Router/Drawer als verbleibende transitive Grenze dokumentiert  |
| 2026-09-13 | 4     | Direkte `react-native-screens`-Dependency entfernt                     | Transitiver Bezug über Expo Router dokumentiert                |
| 2026-09-13 | 2     | Statische Navigationsliste von `FlatList` auf `ScrollView` umgestellt  | 501 Unit-Tests, 100% Coverage, Lint und TypeScript erfolgreich |
| 2026-09-13 | 2     | Portrait-Projektliste von `FlatList` auf `ScrollView` umgestellt       | 501 Unit-Tests, 100% Coverage, Lint und TypeScript erfolgreich |

Bei jeder Migrationserweiterung wird diese Tabelle ergänzt und der Status der
betroffenen Phase aktualisiert.
