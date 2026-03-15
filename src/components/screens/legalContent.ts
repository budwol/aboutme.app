import { AppData } from "@/app-data";
import { getLangCode } from "@services/i18n/i18n";
import { escapeHtml } from "@utils/htmlSanitizer";

type SupportedLang = "de" | "en";

function getSupportedLang(lang = getLangCode()): SupportedLang {
  return lang === "de" ? "de" : "en";
}

export function buildDisclaimerHtml(
  appData: AppData,
  lang = getSupportedLang(),
) {
  if (lang === "en") {
    return `
      <h2>Imprint</h2>

      <h3>Provider information pursuant to Section 5 DDG</h3>
      <p>
        <strong>Responsible for content:</strong><br/>
        ${escapeHtml(appData.profile.name)}<br/>
        ${escapeHtml(appData.contact.addressStreet)}<br/>
        ${escapeHtml(appData.contact.addressZipCode)} ${escapeHtml(appData.contact.addressCity)}<br/>
        ${escapeHtml(appData.contact.addressCountry)}
      </p>

      <h3>Contact</h3>
      <p>
        Phone: ${escapeHtml(appData.contact.phone)}<br/>
        E-Mail: ${escapeHtml(appData.contact.email)}
      </p>

      <h3>Disclaimer</h3>
      <p>
        The content presented in this portfolio is created and maintained by the operator.
        No guarantee is given for the correctness, completeness or up-to-dateness of the content.
      </p>

      <p>
        As a service provider, we are responsible for our own content on these pages under the
        general laws. However, we are not obliged to monitor transmitted or stored third-party
        information or investigate circumstances indicating unlawful activity. Obligations to
        remove or block the use of information under general law remain unaffected.
      </p>

      <p>
        Liability in this respect is only possible from the time a specific infringement becomes
        known. Upon becoming aware of corresponding legal violations, we will remove such content immediately.
      </p>

      <p>
        The operators of linked pages are solely responsible for their content. No liability is
        assumed for damages arising from the use of content provided within this app.
      </p>

      <p>
        Use of this app is at your own risk. No liability is accepted for damage to hardware,
        software or loss of data that may arise from using this app.
      </p>

      <h3>Copyright</h3>
      <p>
        Content and works created by the site operator are subject to German copyright law.
        Reproduction, editing, distribution and any kind of exploitation outside the limits of
        copyright law require the written consent of the respective author or creator.
      </p>
    `;
  }

  return `
    <h2>Impressum</h2>

    <h3>Angaben gemäß § 5 DDG</h3>
    <p>
      <strong>Verantwortlich für den Inhalt:</strong><br/>
      ${escapeHtml(appData.profile.name)}<br/>
      ${escapeHtml(appData.contact.addressStreet)}<br/>
      ${escapeHtml(appData.contact.addressZipCode)} ${escapeHtml(appData.contact.addressCity)}<br/>
      ${escapeHtml(appData.contact.addressCountry)}
    </p>

    <h3>Kontakt</h3>
    <p>
      Telefon: ${escapeHtml(appData.contact.phone)}<br/>
      E-Mail: ${escapeHtml(appData.contact.email)}
    </p>

    <h3>Haftungsausschluss (Disclaimer)</h3>
    <p>
      Die innerhalb dieses Portfolios dargestellten Inhalte werden vom Betreiber erstellt und gepflegt.
      Es wird keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität dieser Inhalte übernommen.
    </p>

    <p>
      Als Diensteanbieter sind wir nach den allgemeinen Gesetzen für eigene Inhalte auf diesen Seiten
      verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
      Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
      bleiben hiervon unberührt.
    </p>

    <p>
      Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
      Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
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

export function buildPrivacyHtml(appData: AppData, lang = getSupportedLang()) {
  if (lang === "en") {
    return `
      <h2>Privacy Policy</h2>

      <p>
        This privacy policy provides information about the processing of personal data on this
        website in accordance with the General Data Protection Regulation (GDPR).
      </p>

      <h3>1. Controller</h3>
      <p>
        ${escapeHtml(appData.profile.name)}<br/>
        ${escapeHtml(appData.contact.addressStreet)}<br/>
        ${escapeHtml(appData.contact.addressZipCode)} ${escapeHtml(appData.contact.addressCity)}<br/>
        ${escapeHtml(appData.contact.addressCountry)}<br/>
        Phone: ${escapeHtml(appData.contact.phone)}<br/>
        E-Mail: ${escapeHtml(appData.contact.email)}
      </p>

      <h3>2. Nature of this website</h3>
      <p>
        This portfolio is a static website. No user accounts, registrations or active submission
        forms for personal data are provided.
      </p>

      <h3>3. Processing of personal data</h3>
      <p>
        When visiting this website, the hosting provider automatically processes technically
        necessary information. This may include in particular:
      </p>

      <ul>
        <li>IP address</li>
        <li>Date and time of the request</li>
        <li>Browser and device information</li>
        <li>Technical connection data</li>
      </ul>

      <p>
        This data is technically required to deliver the website and to ensure operational
        stability and security.
      </p>

      <h3>4. Purpose and legal basis</h3>
      <p>
        Processing is carried out on the basis of Art. 6 para. 1 lit. f GDPR due to the legitimate
        interest in providing a secure and functional web presence.
      </p>

      <h3>5. Local storage and no tracking tools</h3>
      <p>
        The operator of this website does not use analytics or marketing tools and does not carry
        out user tracking. Depending on usage, only technically necessary local storage may occur
        on the end device in order to remember display settings of the website, such as the selected theme.
      </p>

      <p>
        Where such local storage is technically necessary, it is based on Section 25 para. 2 no. 2 TDDDG.
        No further storage of or access to information on the end device takes place for analytics,
        advertising or tracking purposes.
      </p>

      <h3>6. Recipients and disclosure of data</h3>
      <p>
        Recipients of data processed in the course of operating the website are primarily the hosting
        provider, insofar as this is technically necessary to provide, deliver and secure the website.
        No further disclosure of personal data takes place unless a legal obligation exists.
      </p>

      <h3>7. Rights of data subjects</h3>
      <p>
        Under Art. 15-21 GDPR, you are entitled in particular to the following rights:
      </p>

      <ul>
        <li>Right of access</li>
        <li>Right to rectification</li>
        <li>Right to erasure</li>
        <li>Right to restriction of processing</li>
        <li>Right to object</li>
        <li>Right to data portability</li>
        <li>Right to lodge a complaint with a data protection supervisory authority</li>
      </ul>

      <h3>8. Storage period</h3>
      <p>
        Personal data contained in server log files when accessing this website is stored only for
        as long as this is necessary for the secure and trouble-free operation of the website or as
        long as statutory retention obligations apply. Display settings stored locally on the end
        device remain until they are deleted by the user or removed in the browser.
      </p>

      <h3>9. Contact</h3>
      <p>
        If you have any questions about data protection, you can contact the controller at any time:<br/>
        E-Mail: ${escapeHtml(appData.contact.email)}
      </p>

      <h3>10. Changes to this privacy policy</h3>
      <p>
        This privacy policy may be amended in order to implement legal requirements or to reflect
        changes to the website.
      </p>
    `;
  }

  return `
    <h2>Datenschutzerklärung</h2>

    <p>
      Diese Datenschutzerklärung informiert über die Verarbeitung personenbezogener Daten
      auf dieser Website gemäß der Datenschutz-Grundverordnung (DSGVO).
    </p>

    <h3>1. Verantwortlicher</h3>
    <p>
      ${escapeHtml(appData.profile.name)}<br/>
      ${escapeHtml(appData.contact.addressStreet)}<br/>
      ${escapeHtml(appData.contact.addressZipCode)} ${escapeHtml(appData.contact.addressCity)}<br/>
      ${escapeHtml(appData.contact.addressCountry)}<br/>
      Telefon: ${escapeHtml(appData.contact.phone)}<br/>
      E-Mail: ${escapeHtml(appData.contact.email)}
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

    <h3>5. Lokale Speicherung und keine Tracking-Tools</h3>
    <p>
      Der Betreiber dieser Website verwendet keine Analyse- oder Marketing-Tools und führt
      kein Nutzertracking durch. Je nach Nutzung kann auf dem Endgerät ausschließlich eine
      technisch notwendige lokale Speicherung erfolgen, um die Anzeigeeinstellungen der Website
      zu merken, etwa die gewählte Darstellung des Themes.
    </p>

    <p>
      Soweit eine solche lokale Speicherung technisch erforderlich ist, erfolgt sie auf Grundlage
      von § 25 Abs. 2 Nr. 2 TDDDG. Eine darüber hinausgehende Speicherung oder ein Zugriff auf
      Informationen in der Endeinrichtung zu Analyse-, Werbe- oder Trackingzwecken findet nicht statt.
    </p>

    <h3>6. Empfänger und Weitergabe von Daten</h3>
    <p>
      Empfänger der im Rahmen des Websitebetriebs verarbeiteten Daten ist in erster Linie der
      Hosting-Provider, soweit dies zur Bereitstellung, Auslieferung und Absicherung der Website
      technisch erforderlich ist. Eine darüber hinausgehende Weitergabe personenbezogener Daten
      erfolgt nicht, sofern keine gesetzliche Verpflichtung besteht.
    </p>

    <h3>7. Rechte der betroffenen Personen</h3>
    <p>
      Ihnen stehen gemäß Art. 15-21 DSGVO folgende Rechte zu:
    </p>

    <ul>
      <li>Recht auf Auskunft</li>
      <li>Recht auf Berichtigung</li>
      <li>Recht auf Löschung</li>
      <li>Recht auf Einschränkung der Verarbeitung</li>
      <li>Recht auf Widerspruch</li>
      <li>Recht auf Datenübertragbarkeit</li>
      <li>Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde</li>
    </ul>

    <h3>8. Speicherdauer</h3>
    <p>
      Personenbezogene Daten, die beim Aufruf dieser Website in Server-Logfiles anfallen, werden
      nur so lange gespeichert, wie dies für den sicheren und störungsfreien Betrieb der Website
      erforderlich ist oder wie gesetzliche Aufbewahrungspflichten bestehen. Lokal auf dem Endgerät
      gespeicherte Anzeigeeinstellungen bleiben bestehen, bis sie durch den Nutzer gelöscht oder
      im Browser entfernt werden.
    </p>

    <h3>9. Kontakt</h3>
    <p>
      Bei Fragen zum Datenschutz können Sie sich jederzeit an den Verantwortlichen wenden:<br/>
      E-Mail: ${escapeHtml(appData.contact.email)}
    </p>

    <h3>10. Änderungen dieser Datenschutzerklärung</h3>
    <p>
      Diese Datenschutzerklärung kann angepasst werden, um rechtliche Anforderungen
      umzusetzen oder Änderungen der Website zu berücksichtigen.
    </p>
  `;
}

export function getTermsHtmlContent(lang = getSupportedLang()) {
  if (lang === "en") {
    return `<h2>Terms of Use</h2>

<p>
The contents of this portfolio are intended solely for general information
and for presenting projects and work.
</p>

<p>
No guarantee is given for the accuracy, completeness or timeliness of the
content provided.
</p>

<p>
Despite careful control of content, no liability is assumed for the content
of external links. The operators of linked pages are solely responsible for
their content.
</p>`;
  }

  return `<h2>Nutzungshinweis</h2>

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
}

export function getLicensesHtmlContent(lang = getSupportedLang()) {
  if (lang === "en") {
    return `<h2>Open Source Software</h2>

<p>
This portfolio was developed using open source software and freely available
libraries. I thank the respective authors and communities for their work.
</p>

<h3>Core technologies used</h3>
<ul>
  <li>React - MIT License</li>
  <li>React Native - MIT License</li>
  <li>React Native Web - MIT License</li>
  <li>Expo - MIT License</li>
  <li>Expo Router - MIT License</li>
  <li>i18next / react-i18next - MIT License</li>
</ul>

<h3>Additional libraries and components</h3>
<ul>
  <li>React Navigation - MIT License</li>
  <li>React Native Reanimated - MIT License</li>
  <li>React Native Gesture Handler - MIT License</li>
  <li>React Native Screens - MIT License</li>
  <li>React Native SVG - MIT License</li>
  <li>Async Storage - MIT License</li>
  <li>Material Design Icons (mdi/js) - MIT License</li>
</ul>

<p>
The applicable license terms and copyright notices can be found in the
official project repositories of the listed libraries.
</p>

<p>
All open source components used remain subject to their respective licenses.
Use of this website does not create any additional rights or claims against
the authors of these libraries.
</p>`;
  }

  return `<h2>Open Source Software</h2>

<p>
Dieses Portfolio wurde unter Verwendung von Open-Source-Software und frei
verfügbaren Bibliotheken entwickelt. Ich danke den jeweiligen Autoren und
Communitys für ihre Arbeit.
</p>

<h3>Verwendete Kerntechnologien</h3>
<ul>
  <li>React - MIT License</li>
  <li>React Native - MIT License</li>
  <li>React Native Web - MIT License</li>
  <li>Expo - MIT License</li>
  <li>Expo Router - MIT License</li>
  <li>i18next / react-i18next - MIT License</li>
</ul>

<h3>Weitere Bibliotheken & Komponenten</h3>
<ul>
  <li>React Navigation - MIT License</li>
  <li>React Native Reanimated - MIT License</li>
  <li>React Native Gesture Handler - MIT License</li>
  <li>React Native Screens - MIT License</li>
  <li>React Native SVG - MIT License</li>
  <li>Async Storage - MIT License</li>
  <li>Material Design Icons (mdi/js) - MIT License</li>
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
}
