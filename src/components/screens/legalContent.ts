import { AppData } from "@/app-data";

export function buildDisclaimerHtml(appData: AppData) {
  return `
    <h2>Impressum</h2>

    <h3>Angaben gemäß § 5 TMG</h3>
    <p>
      <strong>Publisher:</strong><br/>
      ${appData.profile.name}
    </p>

    <h3>Kontakt</h3>
    <p>
      ${appData.contact.addressStreet}<br/>
      ${appData.contact.addressZipCode} ${appData.contact.addressCity}<br/>
      ${appData.contact.addressCountry}
    </p>

    <h3>Haftungsausschluss (Disclaimer)</h3>
    <p>
      Die innerhalb dieser App dargestellten Inhalte werden von den Nutzern erstellt und hochgeladen.
      Es wird keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität dieser Inhalte übernommen.
    </p>

    <p>
      Als Anbieter dieser App sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte nach den allgemeinen
      Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte
      oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
      eine rechtswidrige Tätigkeit hinweisen.
    </p>

    <p>
      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
      Gesetzen bleiben hiervon unberührt. Eine entsprechende Haftung ist jedoch erst ab dem Zeitpunkt
      der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
      Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
    </p>

    <p>
      Für die Inhalte verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich. Es wird
      keine Haftung für Schäden übernommen, die aus der Nutzung der innerhalb der App enthaltenen
      Inhalte entstehen.
    </p>

    <p>
      Die Nutzung dieser App erfolgt auf eigene Gefahr. Es wird keine Haftung für Schäden an Hard-
      oder Software oder für Datenverluste übernommen, die durch die Nutzung der App entstehen können.
    </p>

    <h3>Urheberrecht</h3>
    <p>
      Die durch den Seitenbetreiber erstellten Inhalte und Werke unterliegen dem deutschen
      Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
      der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw.
      Erstellers.
    </p>
  `;
}

export function buildPrivacyHtml(appData: AppData) {
  return `
    <h2>Datenschutzerklärung</h2>

    <p>
      Diese Datenschutzerklärung informiert über die Verarbeitung personenbezogener Daten
      auf dieser Website gemäß der Datenschutz-Grundverordnung (DSGVO).
    </p>

    <h3>1. Verantwortlicher</h3>
    <p>
      ${appData.profile.name}<br/>
      ${appData.contact.addressCountry}<br/>
      E-Mail: ${appData.contact.email}
    </p>

    <h3>2. Art der Website</h3>
    <p>
      Dieses Portfolio ist eine statische Website. Es werden keine Benutzerkonten,
      keine Registrierungen und keine aktiven Eingaben personenbezogener Daten angeboten.
    </p>

    <h3>3. Verarbeitung personenbezogener Daten</h3>
    <p>
      Beim Besuch dieser Website werden durch den Hosting-Provider automatisch technisch
      notwendige Informationen verarbeitet. Dies kann insbesondere umfassen:
    </p>

    <ul>
      <li>IP-Adresse</li>
      <li>Datum und Uhrzeit der Anfrage</li>
      <li>Browser- und Geräteinformationen</li>
      <li>Technische Verbindungsdaten</li>
    </ul>

    <p>
      Diese Daten sind technisch erforderlich, um die Website auszuliefern und die
      Stabilität sowie Sicherheit des Betriebs zu gewährleisten.
    </p>

    <h3>4. Zweck und Rechtsgrundlage</h3>
    <p>
      Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aufgrund
      des berechtigten Interesses an einem sicheren und funktionsfähigen Webauftritt.
    </p>

    <h3>5. Keine Speicherung durch den Betreiber</h3>
    <p>
      Der Betreiber dieser Website speichert selbst keine personenbezogenen Daten,
      führt kein Nutzertracking durch und verwendet keine Analyse- oder Marketing-Tools.
    </p>

    <h3>6. Weitergabe von Daten</h3>
    <p>
      Eine Weitergabe personenbezogener Daten erfolgt nicht, außer soweit dies technisch
      durch den Hosting-Provider erforderlich ist.
    </p>

    <h3>7. Rechte der betroffenen Personen</h3>
    <p>
      Ihnen stehen gemäß Art. 15–21 DSGVO folgende Rechte zu:
    </p>

    <ul>
      <li>Recht auf Auskunft</li>
      <li>Recht auf Berichtigung</li>
      <li>Recht auf Löschung</li>
      <li>Recht auf Einschränkung der Verarbeitung</li>
      <li>Recht auf Widerspruch</li>
    </ul>

    <h3>8. Kontakt</h3>
    <p>
      Bei Fragen zum Datenschutz können Sie sich jederzeit an den Verantwortlichen wenden:<br/>
      E-Mail: ${appData.contact.email}
    </p>

    <h3>9. Änderungen dieser Datenschutzerklärung</h3>
    <p>
      Diese Datenschutzerklärung kann angepasst werden, um rechtliche Anforderungen
      umzusetzen oder Änderungen der Website zu berücksichtigen.
    </p>
  `;
}

export const termsHtmlContent = `<h2>Nutzungshinweis</h2>

<p>
Die Inhalte dieses Portfolios dienen ausschließlich der allgemeinen Information
und Präsentation von Projekten und Arbeiten.
</p>

<p>
Es wird keine Gewähr für Richtigkeit, Vollständigkeit oder Aktualität der
bereitgestellten Inhalte übernommen.
</p>

<p>
Trotz sorgfältiger inhaltlicher Kontrolle wird keine Haftung für die Inhalte
externer Links übernommen. Für den Inhalt der verlinkten Seiten sind ausschließlich
deren Betreiber verantwortlich.
</p>`;

export const licensesHtmlContent = `<h2>Open Source Software</h2>

<p>
Dieses Portfolio wurde unter Verwendung von Open-Source-Software und frei
verfügbaren Bibliotheken entwickelt. Ich danke den jeweiligen Autoren und
Communitys für ihre Arbeit.
</p>

<h3>Verwendete Kerntechnologien</h3>
<ul>
  <li>React – MIT License</li>
  <li>React Native – MIT License</li>
  <li>React Native Web – MIT License</li>
  <li>Expo – MIT License</li>
  <li>Expo Router – MIT License</li>
  <li>i18next / react-i18next – MIT License</li>
</ul>

<h3>Weitere Bibliotheken & Komponenten</h3>
<ul>
  <li>React Navigation – MIT License</li>
  <li>React Native Reanimated – MIT License</li>
  <li>React Native Gesture Handler – MIT License</li>
  <li>React Native Screens – MIT License</li>
  <li>React Native SVG – MIT License</li>
  <li>Async Storage – MIT License</li>
  <li>Material Design Icons (mdi/js) – MIT License</li>
</ul>

<p>
Die jeweiligen Lizenzbedingungen und Copyright-Hinweise sind in den
offiziellen Projekt-Repositories der genannten Bibliotheken einsehbar.
</p>

<p>
Alle verwendeten Open-Source-Komponenten unterliegen ihren jeweiligen
Lizenzen. Durch die Nutzung dieser Website entstehen keinerlei zusätzliche
Rechte oder Ansprüche gegenüber den Urhebern der Bibliotheken.
</p>`;
