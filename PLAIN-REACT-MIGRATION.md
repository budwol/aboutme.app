# Plain React Migration

Fortschritt: `[##########----------]` 50% (2 von 4 Phasen abgeschlossen)

Status: **in Arbeit** (Phase 1 und 2 abgeschlossen, Phase 3 als nächstes). Dieses
Dokument ist am 2026-09-15 vollständig anhand des
tatsächlichen Codestands neu geschrieben worden (vorherige Fassung stammte von
vor Abschluss der Web-Only-Migration und war an mehreren Stellen nicht mehr
zutreffend — siehe "Korrektur 2026-09-15" unten). Phase 1 ist seit
2026-09-15 umgesetzt (siehe Fortschrittsprotokoll); jede Datei-/API-Angabe
unten ist am 2026-09-15 gegen den Code verifiziert (grep + gezielte
Stichproben), keine Vermutung.

## Korrektur 2026-09-15

Die vorherige Fassung ging von einer noch nicht abgeschlossenen
Web-Only-Migration aus ("Phase 1: Browser-Foundation... View/Text/Pressable
auf DOM ausrichten"). Das ist überholt: `WEB-ONLY-MIGRATION.md` ist
vollständig abgeschlossen und wurde entfernt. Verifiziert per
`grep -rl "from \"react-native\"" src` (ohne Tests): **kein einziges**
`View`, `Text`, `Pressable`, `FlatList`, `ScrollView`, `Image` oder
`StyleSheet.create` für Layout-Zwecke ist mehr im Code — die verbleibenden
19 Dateien mit `react-native`-Import nutzen ausschließlich kleine,
mechanisch ersetzbare APIs (siehe Phase 1). Der ursprüngliche 5-Phasen-Plan
("Browser-Foundation" → "Web-Navigation" → "Browser-Services" →
"Expo-Ablösung" → "Cleanup") ist durch die 4 Phasen unten ersetzt, die den
tatsächlich verbleibenden Aufwand abbilden. Phase "Browser-Foundation" im
alten Sinn entfällt komplett — sie ist bereits Teil der Web-Only-Migration
gewesen.

## Ziel

Die statische PWA läuft mit plain React, React DOM und Browser-APIs. Expo,
React Native, React Native Web und native-orientierte Hilfsbibliotheken sind
aus dem Produktionspfad entfernt. Inhalte, Accessibility, Deep Links,
Navigationstransitions, Background-Image, Offline-Verhalten, die bilinguale
URL-Struktur (siehe Phase 2) und die bestehende `noindex`-Policy bleiben
erhalten.

## Leitplanken

- `react` und `react-dom` bleiben die einzigen UI-Runtime-Grundlagen.
- Semantisches HTML, CSS und Browser-APIs ersetzen React-Native-Primitives.
- Die Migration erfolgt phasenweise mit grünen Unit-, Integrations- und E2E-
  Regressionstests vor jedem nächsten Schritt.
- Jede entfernte Dependency muss vorher produktionsweit gesucht (`grep -rl`)
  und danach mit `npm ls`, Bundle-Gates und einem Clean-Export geprüft werden.
- `noindex, nofollow` bleibt unverändert und darf nicht zur Lighthouse-
  Optimierung aktiviert werden. Das bedeutet auch: Es besteht **keine**
  SEO-/Crawler-Anforderung an serverseitig vorgerenderte Einzelseiten — eine
  klassische Client-Side-Rendering-SPA mit einer `index.html` ist
  ausreichend (siehe Phase 3, das vereinfacht die Export-Ablösung deutlich
  gegenüber Expo Routers Pro-Route-Static-Export).
- Versionierung und Release-Tags bleiben unverändert bis zum Abschluss eines
  geprüften Migrationsschritts.
- Vor jeder Phase: aktuelle Produktions-Lighthouse-Werte als Regressionsbasis
  nehmen (Stand 2026-09-14, gemessen gegen `https://wb.wna24.de/`:
  Performance 97, Accessibility 100, Best Practices 100, SEO 66). Kein Wert
  darf sich durch diese Migration verschlechtern.

## Korrektur 2026-09-15 (2)

Der ursprüngliche Eintrag unten ("Sofort möglich: `expo-linking`
entfernen") war unvollständig verifiziert — geprüft wurde nur, ob `src/`
`expo-linking` importiert, nicht, ob `expo-router` selbst es als Peer
braucht. Tatsächlich ist `expo-linking` ein **nicht-optionaler** Peer von
`expo-router` (`node_modules/expo-router/package.json`,
`peerDependencies`, fehlt in `peerDependenciesMeta`) und wird intern von
`expo-router` verwendet (`build/link/linking.js`,
`build/fork/useLinking.native.js`, `build/ui/TabRouter.js`,
`build/views/Unmatched.js`). Ein bestehender Test
(`src/scripts/packageScripts/index.test.ts`, "keeps required Expo Router
and drawer peers installed directly") schützt genau davor, ihn zu
entfernen, solange `expo-router` noch im Einsatz ist. **`expo-linking`
kann daher nicht "sofort" entfernt werden** — das verschiebt sich auf
Phase 3/4, zusammen mit `expo-router` selbst und den übrigen
Peer-Dependencies. Es gibt aktuell keinen weiteren "sofort möglich"-
Punkt; die Migration beginnt direkt mit Phase 1.

## Dependency-Zielbild (verifiziert 2026-09-15)

| Dependency                                                                                                                                   | Aktuell genutzt von                                                                                                                        | Ziel      | Phase                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------- |
| `expo-linking`                                                                                                                               | niemandem direkt in `src/` — aber nicht-optionaler Peer von `expo-router`                                                                  | entfernen | 3 (fällt automatisch mit expo-router weg) |
| `react-native-safe-area-context`, `react-native-screens`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets` | niemandem direkt — nur noch Peer-Dependencies von `expo-router`/`@react-navigation/native`                                                 | entfernen | 3 (fällt automatisch mit expo-router weg) |
| `react-native-logs`                                                                                                                          | `src/utils/loggerBase/index.ts` (1 Datei)                                                                                                  | entfernen | 1                                         |
| `@react-navigation/native`                                                                                                                   | niemandem mehr (Phase 2 hat `useFocusEffect`/`useIsFocused` durch `useEffect` ersetzt) — nur noch transitive `expo-router`-Peer-Dependency | entfernen | 3 (fällt automatisch mit expo-router weg) |
| `expo-router`                                                                                                                                | nur noch der minimale Bootstrap-Shim in `src/app/` (siehe Phase 2) — keine Routing-API mehr sonst in `src/` genutzt                        | entfernen | 3                                         |
| `expo`, `expo-doctor`, `jest-expo`, `eslint-config-expo`, `expo-constants`                                                                   | Build/Dev-Tooling, `app.config.ts`, `metro.config.js`, `jest.config.cjs`, `currentAppVersion.ts`, `eslint.config.cjs`                      | entfernen | 3                                         |
| `react-native`, `react-native-web`                                                                                                           | 19 Dateien, siehe Phase 1 (Rest-APIs) — Grundlast fällt mit `expo`/`expo-router` weg, da diese sie als Peer verlangen                      | entfernen | 3/4                                       |

## Phasen

### Phase 1: React-Native-API-Restspuren entfernen

Status: **abgeschlossen** (2026-09-15) · Risiko: niedrig · Umfang: 19
Quelldateien in 7 Kategorien (`WnaHeader.tsx` zählt in zwei Kategorien, b
und d) · unabhängig von Phase 2/3, kann zuerst und isoliert gemacht werden.

Alle 7 Kategorien umgesetzt: (a) `StyleSheet.flatten`/`.create` durch die
neue generische Utility `src/utils/flattenStyle.ts` ersetzt (7 Dateien);
(b) `useColorScheme` durch den neuen Hook
`src/utils/useBrowserColorScheme.ts`
(`window.matchMedia("(prefers-color-scheme: dark)")`, SSR-sicher wie
`webViewport.ts`) ersetzt (4 Dateien), `ColorSchemeName` durch dessen
`BrowserColorScheme`-Typ ersetzt (2 weitere Dateien); (c)
`useWindowDimensions` in `WnaExperienceSection.tsx` durch
`useWnaLayout().currentWindowWidth` ersetzt, `DimensionValue` durch
`CSSProperties["width"]`; (d) `Platform.OS === "web"` in `WnaHeader.tsx`
ersatzlos vereinfacht; (e) `ViewStyle`/`TextStyle` durch `CSSProperties`
ersetzt (3 Dateien); (f) `NativeScrollEvent`/`NativeSyntheticEvent` in
`useWnaScrollY.ts` durch `React.UIEvent<HTMLDivElement>` ersetzt, alle 4
Aufrufer (nicht nur die ursprünglich vermuteten 3 — `WnaScrollViewScreen.tsx`
war ein zusätzlicher, zunächst übersehener vierter Aufrufer, siehe
Validierungshinweis unten) auf direkte Übergabe des Hooks umgestellt; (g)
`LogBox`/`react-native-logs` in `loggerBase/index.ts` durch einen
~30-Zeilen-Wrapper um `console.log/info/warn/error` ersetzt,
`react-native-logs` aus `package.json` entfernt.

Zusätzlich vorab korrigiert: der ursprüngliche "Sofort möglich"-Punkt
(`expo-linking` entfernen) war falsch — es ist ein nicht-optionaler Peer
von `expo-router` und wird von diesem intern verwendet; verschoben auf
Phase 3 (siehe "Korrektur 2026-09-15 (2)" oben).

**Validierungshinweis:** Die reguläre Unit-/Integrations-/Typecheck-Suite
hätte den vierten `useWnaScrollY`-Aufrufer (`WnaScrollViewScreen.tsx`)
nicht aufgedeckt — sie blieb durchgehend grün, weil die dortige,
inzwischen überholte manuelle `{ nativeEvent: { contentOffset: ... } }`-
Adaption in ihrem eigenen Test exakt gegen sich selbst mockt. Erst die
volle E2E-Suite (`npm run test:e2e`) zeigte einen echten
`pageerror: Cannot read properties of undefined (reading 'scrollTop')`
auf der mobilen Kontaktseite. Gegenprobe: derselbe Testlauf gegen den
Stand vor dieser Phase (`git stash`) war 4/4 grün, der Stand mit dem Bug
war 4/4 rot — bestätigt eine echte Regression, keine Umgebungs-Flakiness.
Lehre für die weiteren Phasen: bei jeder Änderung an einem geteilten Hook
zusätzlich `grep -rl "<hookName>" src` (nicht nur die zuvor dokumentierte
Aufruferliste) gegenprüfen, und die E2E-Suite ist für dieser Art Fehler
die einzige Suite mit tatsächlicher Trefferquote.

Validierung: `test:prettier`, `lint`, `test:types`, `test:circular`,
`test:unit` (573 Tests), `test:coverage` (100 %), `test:integration`,
`test:deps`, `test:e2e` (47 Tests, je 5× wiederholt für die zuvor
betroffenen Specs) — alle grün.

Jede verbleibende `react-native`-Import-Stelle ist geprüft. Es ist **keine**
`View`/`Text`/`Pressable`/`FlatList` mehr darunter — nur folgende
Kategorien:

**a) `StyleSheet.flatten`/`StyleSheet.create` als reines Merge-Utility**
(7 Dateien, keine RN-Laufzeit-Semantik, nur Array-von-Style-Objekten
zusammenführen):
`src/components/screens/WnaProjectDetailsRoute/WnaPrivateRepoModal.tsx`,
`src/components/images/WnaImageElement/WnaImageElement.tsx`,
`src/components/buttons/WnaPressable.tsx`,
`src/components/buttons/WnaButtonIconText.tsx`,
`src/components/buttons/WnaButtonIcon/WnaButtonIconBadge.tsx`,
`src/components/buttons/WnaButtonIcon/WnaButtonIcon.tsx`,
`src/components/buttons/WnaBasePressable/WnaBasePressable.tsx`.
→ Ersetzen durch eine einzige eigene Utility (z. B.
`src/utils/flattenStyle.ts`): `flatten(styles: (CSSProperties | undefined |
null | false)[]): CSSProperties` via `Object.assign({}, ...styles.filter(Boolean))`.
`StyleSheet.create` wird zum No-Op (`const create = <T>(styles: T): T =>
styles`), da es in RN nur der Typprüfung/Performance dient.

**b) `useColorScheme`** (4 Dateien): `src/components/WnaApp.tsx`,
`src/navigation/components/WnaDrawerMenu.tsx`,
`src/components/screens/WnaMenuRoute.tsx`,
`src/components/chrome/WnaHeader.tsx`. Alle nutzen nur den Rückgabewert
(`"light" | "dark" | null`), gereicht an `toggleWnaTheme`/`resolveAppColors`.
→ Eigener Hook `useBrowserColorScheme()` in `src/utils/` via
`window.matchMedia("(prefers-color-scheme: dark)")` + `change`-Listener,
SSR-sicher wie `webViewport.ts` (Server/Test-Fallback `null`). ~15 Zeilen,
1:1-Ersatz für `ColorSchemeName`-Rückgabetyp.

**c) `useWindowDimensions` + `DimensionValue`** (1 Datei):
`src/components/sections/WnaExperienceSection/WnaExperienceSection.tsx`,
Zeile `const { width } = useWindowDimensions();`. → Bereits vorhandenen
`useWnaLayout().currentWindowWidth` verwenden (identische Datenquelle,
`window.innerWidth`, in `WnaAppContext` schon resize-getrackt) — spart sogar
eine Zeile. `DimensionValue` (Typ für `nextTimelineWidth`) → `CSSProperties["width"]`.

**d) `Platform`** (1 Datei): `src/components/chrome/WnaHeader.tsx`,
`Platform.OS === "web"` in der `canUseBrowserBack`-Bedingung. → Bedingung ist
in einer Plain-React-Web-App immer wahr; Zeile ersatzlos vereinfachen
(`typeof window !== "undefined" && window.history.length > 1`).

**e) Reine Typ-Importe** (5 Dateien, kein Laufzeitcode):
`ViewStyle` in `src/components/effects/wnaShadowStyle.ts` und
`src/components/effects/WnaBlurView.tsx` → `CSSProperties`.
`TextStyle` in `src/components/icon/WnaIcon/WnaIconMap.ts` → `CSSProperties`.
`ColorSchemeName` in `src/utils/themeColors/index.ts` und
`src/components/theme/wnaThemeToggle.ts` → `"light" | "dark" | null` (oder
Re-Export aus dem neuen `useBrowserColorScheme`-Modul).

**f) `NativeScrollEvent`/`NativeSyntheticEvent`** (1 Datei, zusätzlich
architektonisch bereinigenswert):
`src/components/screens/useWnaScrollY.ts`. Alle 3 Aufrufer
(`WnaHomeRoute.tsx`, `WnaProjectsRoute.tsx` ×2 Stellen) bauen bereits heute
ein künstliches `{ nativeEvent: { contentOffset: { y: ... } } }`-Objekt aus
einem echten `React.UIEvent<HTMLDivElement>`, nur um die RN-Typsignatur zu
erfüllen (Kommentar in `WnaHomeRoute.tsx` referenziert dabei fälschlich
"still-RN screens" — auch das ist überholt, `WnaProjectsRoute` ist ebenfalls
DOM). → `onScroll` direkt auf `React.UIEvent<HTMLDivElement>` umstellen,
`event.currentTarget.scrollTop` lesen, die Wrapper-Objekte an allen 3
Aufrufstellen entfernen. Kleinere, klarere Diffs als reines Typ-Swapping.

**g) `LogBox` + `react-native-logs`** (1 Datei):
`src/utils/loggerBase/index.ts`. Nutzt nur `LogBox.ignoreLogs(...)` (im
Browser wirkungslos, kann ersatzlos entfallen) und
`logger.createLogger`/`mapConsoleTransport` aus `react-native-logs` für ein
Leveled-Logging mit Ignore-Filter (bereits selbst geschrieben:
`shouldIgnoreLogMessage`). → Durch einen ~25-Zeilen-Wrapper um
`console.log/info/warn/error` ersetzen, der dieselbe `writeLog`/`LoggerBase`-
Oberfläche behält (keine Aufrufer-Änderung nötig, nur das interne
Transport-Modul tauschen). Bestehende Tests in
`src/utils/loggerBase/index.test.ts` als Verhaltensvertrag nutzen.

Exit-Kriterium: `grep -rl "from \"react-native\"\|from \"react-native-logs\"" src`
(ohne Tests) liefert keine Treffer mehr. Volle Unit-/Integrations-/E2E-Suite
grün, 100 % Coverage weiter erfüllt.

### Phase 2: Routing-Ablösung (`expo-router` + `@react-navigation/native`)

Status: **abgeschlossen** (2026-09-15) · Risiko: mittel-hoch · das ist der
eigentliche Kern der Migration.

Umgesetzt: ein neuer, handgeschriebener Router unter
`src/navigation/router/` (`wnaRouter.ts` — History-API-Singleton +
`useWnaPathname()` via `useSyncExternalStore`; `wnaRouteTable.ts` —
`matchRoute()` gegen die unveränderte `routeDefinitions`-Tabelle plus
Slug-Erkennung; `WnaRoutes.tsx` — löst die aktuelle Route auf und rendert
sie, Fallback per `router.replace()`; `WnaRedirect.tsx` — Drop-in für die
drei verbliebenen deklarativen Redirects) ersetzt vollständig
`useRouter`/`useLocalSearchParams`/`useSegments`/`usePathname`/`Redirect`/
`<Slot>`/`<Stack>`/`<Tabs>` in der gesamten Anwendung.
`getDrawerNavigationPath`/`getDrawerProjectNavigationPath`
(`wnaNavigationRoutes.ts`) sind zu `getNavigationPath`/
`getProjectNavigationPath` vereinfacht (kein `/(drawer)/(tabs-…)`-Präfix
mehr nötig). `WnaTabLayout.tsx`, `WnaStackLayout.tsx`,
`WnaStackScreenOptions.tsx` und `wnaTabLayoutConfig.ts` sind gelöscht
(Befund 2 bestätigt: keine sichtbare UI, kein zu erhaltender Zustand).
`useFocusEffect`/`useIsFocused` sind durch einen einfachen `useEffect`
ersetzt (`WnaBaseScreen.tsx`, `WnaWebBaseScreen.tsx`).

**`src/app/` bleibt bewusst bestehen, aber minimal**: `_layout.tsx`
(Shim, mountet `WnaRootLayout`), `+html.tsx` (unverändert), `+not-found.tsx`
sowie 17 Ein-Zeilen-Stub-Dateien (`export { default } from
"@/navigation/router/WnaRoutes"`), je eine pro echtem URL-Pfad aus
`routeDefinitions` plus die zwei dynamischen Slug-Routen. Grund: ein
einzelner Catch-all (`[...all].tsx`) wurde zuerst versucht und
funktionierte im Dev-Server einwandfrei, brach aber beim echten
`expo export -p web` zwei unabhängige Dinge, die nur der volle
Validierungslauf (nicht `test:unit`/`test:integration`) aufgedeckt hat:
(1) `dist/index.html` wurde nicht mehr erzeugt — ein Wildcard-Routenknoten
kann von Expos Exporter nicht auf einen konkreten Pfad vorgerendert
werden, das hätte eine Serverseitig konfigurierte SPA-Fallback-Regel für
die Produktions-Domain vorausgesetzt, die aktuell nicht existiert (und
deren Einführung eine bewusste, mit dem Nutzer abgestimmte
Infrastruktur-Änderung wäre, keine Nebenwirkung dieser Phase); (2) echte
unbekannte Pfade luden gar nicht mehr die eigene App (landeten auf Expos
eingebauter Default-404-Seite statt auf `WnaRoutes`' eigener
"kein Match → redirect"-Logik), weil ohne konkrete Datei pro Route auch
kein `+not-found.tsx` mehr fürs Auffangen zuständig war. Die
Stub-Datei-Lösung reproduziert exakt das bisherige
Pro-Route-Export-Verhalten (verifiziert: alle 20 vorher vorhandenen
`dist/**/*.html`-Dateien inkl. `dist/index.html` entstehen weiterhin,
`test:smoke` grün) und hält damit das Deployment-Modell unverändert — eine
Vereinfachung auf eine einzelne `index.html` bleibt bewusst Phase 3
vorbehalten, wo sie ohnehin ansteht (siehe dortige Sektion) und dort mit
einer expliziten Hosting-Absprache einhergehen kann.

**Genutzte API-Oberfläche** (22 Dateien, per grep vollständig erfasst):
`Slot` (2×, Root- und Drawer-Layout), `Stack`/`Stack.Screen` (2×, siehe
unten), `Tabs`/`Tabs.Screen` (1×, siehe unten), `router` (Imperative-Navigate-
Objekt), `useRouter`, `useLocalSearchParams`, `useSegments`, `usePathname`,
`Redirect` (2×: `+not-found.tsx`, `WnaLegalDocumentScreen.tsx`, sowie
`WnaProjectDetailsRoute.tsx` bei unbekanntem Slug), `Href`/`Router`/
`ErrorBoundaryProps` (reine Typen). Dazu aus `@react-navigation/native`:
`useFocusEffect` (`WnaBaseScreen.tsx`, registriert/deregistriert das
Navigationstransition-Hintergrundbild beim Fokuswechsel) und `useIsFocused`
(`WnaWebBaseScreen.tsx`, setzt `document.title` nur wenn der Screen fokussiert
ist).

**Wichtiger, bereits verifizierter Befund — bilinguale URLs ohne Sprachpräfix:**
Die Routen liegen NICHT unter `/de/...`/`/en/...`, sondern beide Sprachen
teilen sich denselben URL-Raum mit übersetzten Segmenten, z. B. Deutsch
`/menu/datenschutz` vs. Englisch `/menu/privacy` für dieselbe logische
Seite (Quelle der Wahrheit: `routeDefinitions` in
`src/navigation/routes/wnaNavigationRoutes.ts`). Intern nutzt expo-router
dafür Datei-Gruppen `(drawer)/(tabs-de)/...` und `(drawer)/(tabs-en)/...`
(Klammer-Gruppen erscheinen nicht in der URL). Jeder Routing-Ersatz **muss**
dieses exakte Muster nachbilden — eine generische `react-router`-Route pro
Pfad reicht nicht, es braucht weiterhin eine Sprache→Segment-Lookup-Tabelle
wie die bestehende `routeDefinitions`. Diese Tabelle kann eins-zu-eins
weiterverwendet werden, unabhängig davon, welche Router-Bibliothek (falls
überhaupt eine) darunterliegt.

**Befund 1 (verifiziert 2026-09-15) — Stack-Animation ist unsichtbar:**
Live-Messung (Playwright, Navigation `/menu` → `/menu/privacy`) der
Overlay-Opazität per `requestAnimationFrame`-Sampling zeigt: die
App-eigene Transition-Overlay (`WnaApp.tsx`, `showNavigationTransition`)
erscheint sofort bei voller Opazität (1) und bleibt **545 ms** lang
vollständig undurchsichtig, bevor sie über 560 ms ausblendet — dabei ist
sie noch bei t+312 ms auf 90 % Opazität. `WnaStackScreenOptions.tsx`s
`animation: "fade_from_bottom"` dauert nur 240 ms und läuft laut
`startNavigationTransition` (420 ms Verzögerung vor dem eigentlichen
`router.push()`) vollständig innerhalb des Opak-Fensters der Overlay ab.
Bestätigt: die Stack-Animation ist praktisch nie sichtbar. **Konsequenz:**
der Ersatzrouter braucht keine eingebaute Transition-/Animations-Engine —
ein einfacher, sofortiger Routenwechsel reicht, die App-eigene Overlay
übernimmt die gesamte visuelle Übergangswirkung unverändert.

**Befund 2 (verifiziert 2026-09-15) — kein Tab-Zustand wird erhalten:**
Live-Test (Playwright): Home-Route 400px herunterscrollen, per Header-Button
zu `/projects` navigieren, per Browser-Back zurück zu `/` — Ergebnis:
`scrollTop` ist nach der Rückkehr **0**, nicht die zuvor gesetzten 400px.
React Navigations Screen-Stack-Mechanismus (der Tabs technisch am Leben
hält) wird also faktisch nicht genutzt, um Scroll- oder anderen
UI-Zustand über einen Tab-Wechsel hinweg zu erhalten. **Konsequenz:**
`<Tabs>` (`WnaTabLayout.tsx`) kann 1:1 durch denselben Mechanismus wie
`<Slot>` ersetzt werden (einfaches Mount/Unmount pro Route, kein
Keep-Alive nötig) — das entfernt eine der ursprünglich vermuteten
Komplexitätsquellen für den Ersatzrouter vollständig.

**Vorgehen:**

1. ~~Fakten sichern~~ — erledigt, siehe Befund 1 und 2 oben.
2. ~~Entscheidung treffen~~ — **entschieden (2026-09-15, mit dem Nutzer
   abgestimmt): handgeschriebener Router** (History API + die bestehende
   `routeDefinitions`-Tabelle + eigenes Pfad-Matching auf Basis von
   `window.location.pathname`). Begründung: keine neue Kern-Abhängigkeit,
   passt zum bisherigen Repo-Muster (eigener Drawer, eigenes Modal, eigene
   Scroll-Adapter statt Fremdbibliotheken), und die App-Größe (9 logische
   Seiten × 2 Sprachen + 1 dynamische Projekt-Slug-Route, keine
   verschachtelten Datenlader nötig) rechtfertigt keine
   Data-Router-Funktionalität, die ohnehin ungenutzt bliebe. Der Verzicht
   auf `react-router`s bereits gelöste Handhabung von Back/Forward,
   `popstate` und Deep-Links ist der bewusst akzeptierte Trade-off.
3. `useRouter().push/replace/back` → äquivalente Funktionen des gewählten
   Routers (bei Eigenbau: `history.pushState`/`replaceState` + eigener
   Listener, `window.history.back()`).
4. `useLocalSearchParams`/dynamische `[slug]`-Route (2 Dateien:
   `projekte/[slug].tsx`, `projects/[slug].tsx`) → Pfadsegment aus dem
   Match extrahieren, bestehende `createProjectSlug`/`getProjectPathSegment`-
   Utilities bleiben unverändert wiederverwendbar.
5. `useSegments` (nur `WnaDrawerMenu.tsx`, zur Aktiv-Markierung des
   aktuellen Drawer-Eintrags) → aktuellen Pfad mit `routeDefinitions`
   abgleichen.
6. `Redirect` (3 Stellen) → `navigate(path, { replace: true })`-Äquivalent
   beim Mount/Render.
7. `useFocusEffect` (`WnaBaseScreen.tsx`) und `useIsFocused`
   (`WnaWebBaseScreen.tsx`) → durch einen einfachen "ist die aktuell
   gematchte Route diese Route"-Vergleich ersetzen (bei einer
   Client-Side-SPA ohne echten Screen-Stack ist "gemountet" ohnehin
   gleichbedeutend mit "fokussiert", da es keine im Hintergrund lebenden
   Screens mehr gibt wie in React Navigations Stack — das vereinfacht diese
   zwei Stellen tendenziell zu einem reinen `useEffect(() => {...}, [])`).
8. `+not-found.tsx` → 404-Fallback-Route im neuen Router registrieren,
   Verhalten (Redirect zur Startseite/Projektliste) beibehalten.
9. Alle 35 Dateien unter `src/app/` (aktuell reine Re-Export-Stubs für
   expo-router) entweder auf eine neue, explizite Routentabelle umziehen
   (z. B. `src/routes.tsx` mit `{ path, Component }[]`) oder das
   Verzeichnis komplett auflösen — abhängig von Entscheidung in Schritt 2.
10. `@react-navigation/drawer` ist bereits entfernt (siehe
    `WEB-ONLY-MIGRATION.md`-Historie) — hier nur `@react-navigation/native`
    entfernen, sobald Schritt 7 fertig ist.

Exit-Kriterium: Alle bestehenden Routen (bilingual, inkl. übersetzter
Slugs), Deep-Links, Browser-Back/Forward, Tastaturnavigation, 404-Fallback
und die Drawer-Aktiv-Markierung funktionieren identisch zu vorher. Kein
Import mehr aus `expo-router` oder `@react-navigation/native` in `src/`
(Tests ausgenommen, bis Testinfrastruktur in Phase 3 mitgezogen wird).
Vollständige E2E-Suite (47 Tests, alle Sprachen/Deep-Links) grün.

### Phase 3: Build-Tooling-Ablösung (`expo` → z. B. Vite)

Status: **geplant** · Risiko: mittel · setzt Phase 2 voraus (Routing darf
nicht mehr von `expo-router` abhängen, bevor der Expo-Dev-Server/-Export
ersetzt wird).

**Was genau an Expo hängt** (verifiziert 2026-09-15):

- `metro.config.js` — Pfad-Aliase (`@`, `@assets`, `@constants`,
  `@components`, `@app`, `@utils`, `wna-logger`) und ein Blocklist-Filter für
  `*.test.*`/`*.spec.*`. Entfällt komplett; Aliase 1:1 in die neue
  Bundler-Config übernehmen (identisch zu denen in `jest.config.cjs`).
- `app.config.ts` — Expo-spezifisches App-Manifest (Name, Version, Icons,
  Service-Worker-Flag, `plugins: ["expo-router"]`). Entfällt komplett; die
  paar zur Laufzeit gebrauchten Werte (`appVersion` über
  `src/utils/currentAppVersion.ts`, aktuell `Constants.expoConfig?.extra?.appVersion`
  aus `expo-constants`) durch eine build-time injizierte Konstante ersetzen
  (Vite: `define`, oder wie bei `EXPO_PUBLIC_DEPLOY_VERSION` schon gehandhabt
  über `.env.local`).
- `src/app/+html.tsx` — Expo Routers Root-HTML-Template (aktuell 238 Zeilen,
  enthält Preloads, Font-Face, alle globalen Keyframes/Utility-Styles,
  Service-Worker-Registrierung). → Wird zu einer normalen `index.html` im
  Projekt-Root (Vite-Konvention); Inhalt bleibt inhaltlich identisch, nur
  der Expo-Router-spezifische Wrapper-Mechanismus (`Root`-Komponente,
  `PropsWithChildren`) entfällt zugunsten eines statischen HTML-Files.
- **Zwei `process.env.EXPO_PUBLIC_*`-Stellen im Browser-Code**:
  `src/utils/versionedAssetUrl/index.ts` (`EXPO_PUBLIC_DEPLOY_VERSION`),
  `src/utils/appConfig/index.ts` (`EXPO_PUBLIC_SITE_URL`). Vite exponiert
  Env-Variablen standardmäßig nur mit `VITE_`-Präfix über
  `import.meta.env.X`, nicht `process.env.X` — entweder beide Stellen auf
  `import.meta.env.X` umstellen (Präfix ggf. per `envPrefix: "EXPO_PUBLIC_"`
  in der Vite-Config beibehalten, um `.env`/`.env.example`/CI-Secrets
  unverändert zu lassen) oder umbenennen. `.env`/`.env.example` haben aktuell
  4 `EXPO_PUBLIC_*`-Variablen (`_DEPLOY_VERSION`, `_SITE_URL`,
  `_APP_VERSION`, `_ENABLE_SOURCE_MAPS`).
- **`npm run web`** (`node scripts/sync-web-app-data.cjs && node
scripts/generate-resume-pdf.cjs && expo start --web`) und
  **`scripts/start-e2e-web.sh`** (dieselbe Kette, endet in
  `CI=1 EXPO_NO_TELEMETRY=1 npx expo start --web --port "$PORT"`) →
  `expo start --web` wird zu `vite dev --port "$PORT"` (o. ä.); der Rest der
  Kette (App-Daten synchronisieren, PDF generieren, dann die zusätzlichen
  Default-Asset-Kopien für bg.webp/sw.js/logo_96.webp, die diese Session
  bereits ergänzt hat) bleibt unverändert.
- **`npm run export:web`** (`... && npx expo export -p web -c && node
scripts/inject-web-shell.cjs`) → `npx expo export -p web` wird zu
  `vite build`. **Vereinfachung möglich**: Da die Seite bewusst
  `noindex, nofollow` ist (keine SEO-Anforderung an vorgerenderte
  Einzelseiten), reicht eine normale Client-Side-Rendering-SPA mit **einer**
  `dist/index.html` — Expo Routers aktuelles Verhalten, für **jede Route
  eine eigene statische HTML-Datei** zu exportieren, ist mehr, als
  gebraucht wird.
- **`scripts/inject-web-shell.cjs`** iteriert aktuell über _alle_
  `dist/**/*.html`-Dateien (wegen des Pro-Route-Exports oben) und injiziert
  in jede denselben statischen Lade-Shell + App-Data-JSON. Mit einer
  einzigen `index.html` vereinfacht sich `collectHtmlFiles`/die Schleife auf
  eine einzelne Datei — reine Vereinfachung, kein Verhaltensverlust (die
  eingefügten Inhalte selbst bleiben identisch, siehe
  `adr/0019-splash-shell-and-intro-overlay-must-match.md`, die
  hartkodierten Style-Werte dort müssen weiterhin mit
  `WnaApp.tsx`/`WnaLoadingCopy` synchron gehalten werden).
- **`scripts/assert-web-bundle.cjs`** — hartkodierter Pfad
  `dist/_expo/static/js/web/*.js` (Expo-spezifische Ausgabestruktur) und
  eine `FORBIDDEN_MARKERS`-Liste (`expo-image`, `react-native-reanimated`).
  → Pfad auf Vites tatsächliche Ausgabestruktur ändern (typischerweise
  `dist/assets/*.js`), Marker-Liste um alle in Phase 1/2/4 entfernten Pakete
  erweitern (z. B. `expo-router`, `react-native`).
- **`scripts/assert-web-pwa.cjs`** — liest `dist/index.html` und
  `public/site.webmanifest`, prüft `noindex`-Meta-Tag, SW-Registrierung,
  Manifest-Felder. Bleibt inhaltlich unverändert, da diese Datei bereits
  gegen die generischen HTML-/Manifest-Inhalte prüft, nicht gegen
  Expo-Spezifika.
- **`scripts/smoke-export.sh`** — ruft `npx expo config --json` auf, um
  `version`/`appVersion` gegen `package.json` zu verifizieren. →
  Äquivalente Prüfung gegen die neue build-time-Konstante (aus
  `app.config.ts`-Ersatz) schreiben.
- **`scripts/ci-local.sh`** — ruft `./node_modules/.bin/expo-doctor` auf
  (Abhängigkeits-/Konfigurationscheck für Expo-Projekte). Entfällt
  ersatzlos, sobald kein Expo-Projekt mehr vorliegt; ggf. durch
  `npm run test:deps` (bereits vorhanden) plus einen `depcheck`-Lauf
  ersetzen, falls unbenutzte Dependencies zusätzlich automatisiert erkannt
  werden sollen.
- **`jest.config.cjs`** — `preset: "jest-expo"`. → Auf einen
  Plain-React-Preset umstellen (`ts-jest` oder `babel-jest` +
  `jest-environment-jsdom`); `moduleNameMapper` (die Pfad-Aliase) bleibt
  strukturell gleich, nur die Werte ggf. an eine neue Verzeichnisstruktur
  anpassen. `jest.setup.cjs` auf Expo-spezifische Mocks/Polyfills prüfen und
  bei Bedarf ausdünnen.
- **`.github/workflows/*.yml`** — keiner der 8 Workflow-Dateien ruft Expo
  direkt auf (alles läuft über `npm run <script>`); CI-seitig ändert sich
  daher nur, was sich transitiv durch die `package.json`-Skript-Änderungen
  oben ergibt. Kein separater YAML-Umbau nötig, nur Re-Verifikation nach
  den Skript-Änderungen.

Exit-Kriterium: `npm run web` und `npm run export:web` funktionieren ohne
Expo. Reproduzierbarer Clean-Runner-Export, `dist/index.html` enthält
identische PWA-/`noindex`-Signale wie bisher, `test:smoke` und `test:e2e`
grün gegen den neuen Build.

### Phase 4: Dependency- und Release-Cleanup

Status: **geplant**

- `expo`, `expo-router`, `expo-constants`, `expo-doctor`,
  `eslint-config-expo`, `jest-expo`, `react-native`, `react-native-web`,
  `@react-navigation/native` sowie die bereits nur noch transitiv
  benötigten `react-native-safe-area-context`, `react-native-screens`,
  `react-native-gesture-handler`, `react-native-reanimated`,
  `react-native-worklets` aus `package.json` entfernen.
- `npm ls --depth=0` (bzw. `npm run test:deps`) muss danach frei von
  Native-/Expo-Paketen sein (ausgenommen bewusst neu eingeführte, siehe
  Phase 2/3 — z. B. `react-router`, falls dafür entschieden).
- `eslint.config.cjs`s `compat.extends("expo", "prettier")` durch einen
  Plain-React/TypeScript-ESLint-Preset ersetzen.
- `metro.config.js`, `app.config.ts` löschen; `.expo`/`.expo-shared` aus
  `.gitignore` entfernen, falls dort noch referenziert.
- Bundle-Größe, Lighthouse (alle 4 Kategorien), Accessibility und die volle
  E2E-Suite auf einem Clean Runner erneut messen und gegen die Baseline aus
  den Leitplanken (Performance 97, Accessibility 100, Best Practices 100,
  SEO 66) vergleichen — keine Regression zulässig.
- Coverage bei 100 % für Statements, Branches, Functions und Lines halten.
- `WEB-ONLY-MIGRATION.md`-Muster übernehmen: diese Datei nach Abschluss
  entweder mit einem letzten, alle Phasen zusammenfassenden Log-Eintrag
  archivieren oder (nach Rücksprache) löschen, wie bereits mit
  `WEB-ONLY-MIGRATION.md` gehandhabt.

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

| Datum      | Phase | Änderung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Validierung                                                                                                                                                                                                                                                                                                                          |
| ---------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-09-13 | -     | Migrationspfad für Plain React nach Release `1.4.0` angelegt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Noch keine Implementierung; Ausgangsstand festgehalten                                                                                                                                                                                                                                                                               |
| 2026-09-15 | -     | Plan vollständig neu geschrieben: Web-Only-Migration ist inzwischen abgeschlossen (alter "Phase 1" entfällt), verbleibende `react-native`-Nutzung auf 19 Dateien/7 Kategorien reduziert und einzeln verifiziert, `expo-router`-API-Oberfläche auf 22 Dateien vollständig erfasst, bilinguale Slug-Routing-Struktur dokumentiert, Stack/Tabs-Redundanz zur eigenen Transition-Overlay per Live-Test indiziert (noch zu bestätigen), Build-Tooling-Kopplung an Expo (Metro, app.config.ts, +html.tsx, Export-Skripte, jest-expo) Datei für Datei aufgelistet, `expo-linking` als toter Import identifiziert | Keine Code-Änderung in dieser Session; Recherche per `grep -rl` (react-native, expo-router, expo-linking, react-native-logs, react-navigation, EXPO_PUBLIC), Playwright-Live-Test der Stack-Transition, Lesen von `metro.config.js`/`app.config.ts`/`jest.config.cjs`/allen `scripts/*.cjs`/`scripts/*.sh`/`.github/workflows/*.yml` |

| 2026-09-15 | 1 | Phase 1 vollständig umgesetzt: alle 7 Kategorien der `react-native`-Restnutzung entfernt (`StyleSheet.flatten`/`.create` → `flattenStyle.ts`, `useColorScheme` → `useBrowserColorScheme.ts`, `useWindowDimensions` → `useWnaLayout().currentWindowWidth`, `Platform.OS` vereinfacht, `ViewStyle`/`TextStyle`/`ColorSchemeName`/`DimensionValue` → Web-Typen, `NativeScrollEvent`/`NativeSyntheticEvent` → `React.UIEvent`, `react-native-logs` → eigener Console-Wrapper); `expo-linking`-Fehleinschätzung aus der letzten Session korrigiert (bleibt bis Phase 3, ist nicht-optionaler `expo-router`-Peer) | `test:prettier`, `lint`, `test:types`, `test:circular`, `test:unit` (573/573), `test:coverage` (100 %), `test:integration` (31/31), `test:deps`, `test:e2e` (47/47, mehrfach wiederholt) — alle grün; ein vierter, zunächst übersehener `useWnaScrollY`-Aufrufer (`WnaScrollViewScreen.tsx`) wurde nur durch die E2E-Suite aufgedeckt (`pageerror` auf der mobilen Kontaktseite) und per `git stash`-Gegenprobe als echte Regression bestätigt, dann gefixt |

| 2026-09-15 | 2 | Phase 2 vollständig umgesetzt: handgeschriebener Router unter `src/navigation/router/` (`wnaRouter.ts`, `wnaRouteTable.ts`, `WnaRoutes.tsx`, `WnaRedirect.tsx`) ersetzt `expo-router`s Routing-API überall in der Anwendung (nur der minimale Bootstrap-Shim in `src/app/` importiert noch `expo-router` selbst); `<Tabs>`/`<Stack>`/zugehörige Konfigurationsdateien gelöscht; `useFocusEffect`/`useIsFocused` durch `useEffect` ersetzt | `test:prettier`, `lint`, `test:types`, `test:circular`, `test:unit` (598/598), `test:coverage` (100 %), `test:integration` (31/31), `test:deps`, `test:e2e` (47/47, 3× wiederholt), `test:smoke` (2×) — alle grün. Ein Catch-all-Routenansatz (`[...all].tsx`) wurde verworfen: er bestand `test:e2e` gegen den Dev-Server, brach aber beim echten `expo export -p web` sowohl `dist/index.html` als auch die 404-Weiterleitung für echte unbekannte Pfade — nur durch `test:smoke` und eine erneute volle `test:e2e`-Runde nach der Korrektur aufgedeckt, siehe Phase-2-Abschnitt oben für Details |

Bei jeder Migrationserweiterung wird diese Tabelle ergänzt und der Status der
betroffenen Phase aktualisiert.
