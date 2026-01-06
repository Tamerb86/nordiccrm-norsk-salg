# Norwegian CRM - Quick Start Guide / Hurtigstartveiledning

## 🇳🇴 Norsk Versjon

### Velkommen til Norwegian CRM!

Dette er et komplett CRM-system designet for norske SMB-bedrifter. Systemet støtter full kunde- og salgshåndtering fra første kontakt til avsluttet handel.

---

## Kom i gang på 5 minutter

### 1. Forstå hovedvisningene

Systemet har 6 hovedvisninger tilgjengelig fra toppmenyen:

- **Dashboard** (🏠): Oversikt over nøkkeltall, aktivitet og ytelse
- **Kontakter** (👥): Administrer alle kunder og potensielle kunder
- **Pipeline** (🎯): Visualiser og administrer salgsmuligheter
- **Oppgaver** (✓): Hold oversikt over hva som må gjøres
- **E-post** (✉️): Send, planlegg og spor e-poster
- **API** (🔌): Konfigurer integrasjoner og webhooks

### 2. Legg til din første kontakt

1. Klikk på **Kontakter** i toppmenyen
2. Klikk på **Ny kontakt** knappen (grønn knapp øverst til høyre)
3. Fyll inn:
   - **Fornavn** og **Etternavn** (påkrevd)
   - E-post, telefon, firma (valgfritt)
   - **Status**: Lead (ny kontakt) / Prospect (kvalifisert) / Kunde / Tapt
   - **Tags**: Legg til egendefinerte tags for kategorisering
   - **Verdi**: Potensiell verdi i NOK
4. Klikk **Lagre kontakt**

💡 **Tips**: Bruk søkefeltet for å finne kontakter raskt. Du kan søke på navn, e-post, firma eller tags.

### 3. Opprett en salgsmulighet (Deal)

1. Klikk på **Pipeline** i toppmenyen
2. Klikk på **Ny deal** knappen
3. Fyll inn:
   - **Tittel**: Beskrivende navn på salget (f.eks. "Konsulentavtale - Acme AS")
   - **Kontakt**: Velg fra eksisterende kontakter
   - **Fase**: Velg hvor i salgsprosessen du er
   - **Verdi**: Forventet salgsverdi i NOK
   - **Sannsynlighet**: 0-100% sjanse for å vinne
   - **Forventet dato**: Når forventer du å lukke salget?
4. Klikk **Opprett deal**

**Bruk Pipeline-visningen:**
- Dra og slipp deals mellom faser
- Klikk på en deal for å se detaljer og legge til aktiviteter
- Bruk filteret for å finne deals basert på verdi, dato eller kontakt
- Skjul/vis lukkede deals med bryteren øverst

### 4. Planlegg en oppgave

1. Gå til **Oppgaver** eller klikk på en kontakt/deal
2. Klikk **Ny oppgave**
3. Fyll inn:
   - **Tittel**: Hva skal gjøres?
   - **Type**: Samtale / E-post / Møte / Oppfølging / Annet
   - **Forfallsdato**: Når må det gjøres?
   - **Prioritet**: Lav / Middels / Høy
   - **Tilknyttet**: Velg kontakt og/eller deal
4. Klikk **Opprett oppgave**

🔔 Forfallte oppgaver vises med rød indikator!

### 5. Logg en aktivitet

For å holde oversikt over all kommunikasjon:

1. Åpne en kontakt eller deal
2. Klikk **Logg aktivitet**
3. Velg type:
   - **Samtale** (📞): Logg telefonsamtaler
   - **E-post** (✉️): Logg e-postkommunikasjon
   - **Møte** (📅): Logg møter
   - **Notat** (📝): Generelle notater
4. Fyll inn:
   - **Emne**: Kort beskrivelse
   - **Varighet**: Hvor lenge tok det? (minutter)
   - **Resultat**: Velg utfall (vellykket, oppfølging nødvendig, ingen svar, etc.)
   - **Notater**: Detaljerte notater
5. Klikk **Lagre aktivitet**

📊 Alle aktiviteter vises i tidslinjen for kontakten/dealen.

### 6. Send en e-post

1. Gå til **E-post** visningen
2. Klikk **Send e-post**
3. Komponér e-posten:
   - **Til**: Velg mottaker (kontakt)
   - **Emne** og **Innhold**
   - **CC/BCC**: Valgfritt
4. **Valgfritt**: 
   - Legg ved filer (maks 10 filer, 25 MB totalt)
   - Bruk en mal fra nedtrekkslisten
   - Sett inn variabler (f.eks. {firstName}, {company})
   - Planlegg for senere sending
   - Sett opp gjentakende sending
5. Klikk **Send** eller **Planlegg**

**E-postfunksjoner:**
- ✅ Automatisk sporing av åpninger og klikk
- ✅ Lagre som mal for fremtidig bruk
- ✅ Planlegg e-poster for fremtidig sending
- ✅ Sett opp gjentakende e-poster (daglig/ukentlig/månedlig)
- ✅ Bruk variabler for personalisering
- ✅ Definer egne variabler
- ✅ Legg ved filer med sikker validering

### 7. Opprett en e-postmal

1. I **E-post** visningen, gå til **Maler** fanen
2. Klikk **Ny mal**
3. Fyll inn:
   - **Navn**: Intern beskrivelse (f.eks. "Oppfølging etter møte")
   - **Kategori**: Organisering (f.eks. "Oppfølging")
   - **Emne**: Standard emne
   - **Innhold**: Standard melding
4. Bruk **variabler** for personalisering:
   - `{firstName}` - Fornavn
   - `{lastName}` - Etternavn
   - `{fullName}` - Fullt navn
   - `{email}` - E-postadresse
   - `{phone}` - Telefonnummer
   - `{company}` - Firmanavn
   - `{today}` - Dagens dato
   - Plus eventuelle egendefinerte variabler!
5. Klikk **Lagre mal**

### 8. Importér kontakter fra CSV

1. Gå til **Kontakter**
2. Klikk **Importér** knappen (øverst til høyre)
3. **Last ned mal** (anbefalt) for å se riktig format
4. Dra CSV-filen til dialogboksen eller klikk for å velge
5. Systemet validerer dataene:
   - ✅ Fornavn og Etternavn er påkrevd
   - ✅ E-post må være gyldig format
   - ✅ Duplikater basert på e-post forhindres
6. Se over eventuelle feil
7. Klikk **Importér** for å fullføre

💾 **CSV-format for kontakter:**
```csv
firstName,lastName,email,phone,company,status,tags,value,source,notes
Ole,Nordmann,ole@example.no,91234567,Acme AS,lead,"kunde;b2b",50000,Nettside,Første kontakt fra kontaktskjema
```

### 9. Eksportér data til CSV

For backup eller analyse:

1. Gå til **Kontakter** eller **Pipeline**
2. Klikk **Eksportér** knappen
3. CSV-filen lastes ned automatisk
4. Åpne i Excel, Google Sheets, eller annet regneark

📦 Alle data eksporteres inkludert tags, relasjoner og metadata.

### 10. Sett opp API-integrasjoner

For å koble CRM-en til andre systemer:

1. Gå til **API** visningen
2. Velg en fane:

**API-nøkler:**
1. Klikk **Opprett nøkkel**
2. Gi den et navn og beskrivelse
3. Velg tillatelser:
   - **Les**: Hent data
   - **Skriv**: Opprett og oppdater data
   - **Slett**: Fjern data
   - **Admin**: Full tilgang
4. Valgfritt: Sett utløpsdato og rate limit
5. Kopier nøkkelen (vises kun én gang!)

**Webhooks:**
1. Klikk **Opprett webhook**
2. Fyll inn:
   - **Navn**: Intern beskrivelse
   - **URL**: Hvor skal events sendes?
   - **Events**: Velg hvilke events som skal trigger webhook
3. Kopier hemmeligheten for signaturverifisering
4. Klikk **Test webhook** for å verifisere

**Integrasjoner:**
1. Velg integrasjonstype (SMTP, SMS, Regnskap, Kalender)
2. Velg leverandør
3. Fyll inn konfigurasjonsdetaljer
4. Klikk **Test tilkobling**
5. Aktiver integrasjonen

### 11. Test API-en

**API Playground:**
1. Gå til **API** → **Playground** fanen
2. Velg et endepunkt fra nedtrekkslisten
3. Legg inn din API-nøkkel
4. Konfigurer parametere eller request body
5. Klikk **Send forespørsel**
6. Se respons, statuskode og responstid
7. Kopier cURL-kommando for eksterne verktøy

**Autentiseringstesting:**
1. Gå til **API** → **Auth Testing** fanen
2. Velg en API-nøkkel å teste
3. Klikk **Kjør test** for individuelle endepunkter
4. Eller klikk **Kjør alle tester** for omfattende validering
5. Se hvilke endepunkter som passerer/feiler basert på tillatelser

---

## Avanserte funksjoner

### Planlagte og gjentakende e-poster

**Planlegg en e-post:**
1. Komponér en e-post som normalt
2. Under komponisten, aktiver **Planlegg sending**
3. Velg dato og tid (minimum 5 minutter frem i tid)
4. Klikk **Planlegg**
5. E-posten sendes automatisk til angitt tid

**Gjentakende e-poster:**
1. Komponér en e-post
2. Aktiver **Planlegg sending**
3. Velg dato og tid
4. Aktiver **Gjentakende sending**
5. Velg mønster:
   - **Daglig**: Send hver X dag(er)
   - **Ukentlig**: Send hver X uke(r)
   - **Månedlig**: Send hver X måned(er)
6. Velg sluttbetingelse:
   - **Aldri**: Fortsett på ubestemt tid
   - **Sluttdato**: Stopp etter en bestemt dato
   - **Etter X forekomster**: Stopp etter et antall sendinger
7. Klikk **Planlegg**

📧 Se alle planlagte og gjentakende e-poster i **E-post** visningen øverst.

### Egendefinerte malvariabler

For å lage dine egne variabler utover systemvariablene:

1. Gå til **E-post** → **Variabler** fanen
2. Klikk **Ny variabel**
3. Fyll inn:
   - **Nøkkel**: Variabelnavn (f.eks. "prosjektnavn")
   - **Etikett**: Visningsnavn
   - **Beskrivelse**: Hva er dette?
   - **Eksempel**: Eksempelverdi
4. Bruk variabelen i maler: `{prosjektnavn}`

**Importér/Eksportér variabler:**
- Klikk menyen øverst til høyre
- **Eksportér variabler**: Last ned som JSON
- **Importér variabler**: Last opp JSON-fil

### Filtrering og søk

**Kontakter:**
- Søk: Skriv i søkefeltet (søker i navn, e-post, firma, tags)
- Tags: Filtrer ved å klikke på en tag

**Pipeline:**
- Klikk filterknappen for avanserte filtre:
  - Minimum/maksimum verdi
  - Datointervall
  - Spesifikk kontakt
  - Søketekst
- Vis/skjul lukkede deals

**Oppgaver:**
- Filtrer etter status (fullført/ikke fullført)
- Filtrer etter prioritet
- Søk i tittel og beskrivelse

---

## Tips og triks

### 🚀 Produktivitet

1. **Bruk tastaturet**: Mange dialoger kan navigeres med Tab og Enter
2. **Tags for organisering**: Bruk tags for rask kategorisering (f.eks. "vip", "partner", "event2024")
3. **Mal-bibliotek**: Sett opp maler for vanlige e-poster for å spare tid
4. **Planlegg e-poster**: Send e-poster på optimale tidspunkter selv om du arbeider sent
5. **Bulk-import**: Bruk CSV-import for å legge til mange kontakter på en gang

### 📊 Rapportering

1. **Dashboard**: Sjekk Dashboard hver morgen for oversikt
2. **Aktivitetsmetrikker**: Spor samtaler, e-poster og møter hver uke
3. **Konverteringsrate**: Følg med på hvor mange deals som vinnes vs. totalt
4. **E-postytelse**: Overvåk åpningsrate og klikkrate for å forbedre meldinger

### 🔒 Sikkerhet

1. **API-nøkler**: Opprett separate nøkler for hver integrasjon
2. **Tillatelser**: Gi minimum nødvendige tillatelser
3. **Utløpsdatoer**: Sett utløpsdatoer for midlertidige nøkler
4. **Regelmessig eksport**: Eksporter data jevnlig for backup

### 🔌 Integrasjoner

1. **Webhooks for sanntidssynkronisering**: Bruk webhooks for å holde andre systemer oppdatert
2. **SMTP for e-post**: Konfigurer SMTP for profesjonell e-postsending
3. **API for tilpassede løsninger**: Bruk API-en for å bygge tilpassede integrasjoner

---

## 🇬🇧 English Version

### Welcome to Norwegian CRM!

This is a complete CRM system designed for Norwegian SMEs. The system supports full customer and sales management from first contact to closed deal.

---

## Get Started in 5 Minutes

### 1. Understand the Main Views

The system has 6 main views accessible from the top menu:

- **Dashboard** (🏠): Overview of key metrics, activity, and performance
- **Contacts** (👥): Manage all customers and prospects
- **Pipeline** (🎯): Visualize and manage sales opportunities
- **Tasks** (✓): Keep track of what needs to be done
- **Emails** (✉️): Send, schedule, and track emails
- **API** (🔌): Configure integrations and webhooks

### 2. Add Your First Contact

1. Click on **Contacts** in the top menu
2. Click the **New contact** button (green button top right)
3. Fill in:
   - **First Name** and **Last Name** (required)
   - Email, phone, company (optional)
   - **Status**: Lead (new contact) / Prospect (qualified) / Customer / Lost
   - **Tags**: Add custom tags for categorization
   - **Value**: Potential value in NOK
4. Click **Save contact**

💡 **Tip**: Use the search field to find contacts quickly. You can search by name, email, company, or tags.

### 3. Create a Sales Opportunity (Deal)

1. Click on **Pipeline** in the top menu
2. Click the **New deal** button
3. Fill in:
   - **Title**: Descriptive name for the sale (e.g., "Consulting Agreement - Acme AS")
   - **Contact**: Select from existing contacts
   - **Stage**: Choose where in the sales process you are
   - **Value**: Expected sales value in NOK
   - **Probability**: 0-100% chance of winning
   - **Expected date**: When do you expect to close the sale?
4. Click **Create deal**

**Using the Pipeline View:**
- Drag and drop deals between stages
- Click on a deal to see details and add activities
- Use the filter to find deals based on value, date, or contact
- Show/hide closed deals with the toggle at the top

### 4. Schedule a Task

1. Go to **Tasks** or click on a contact/deal
2. Click **New task**
3. Fill in:
   - **Title**: What needs to be done?
   - **Type**: Call / Email / Meeting / Follow-up / Other
   - **Due Date**: When must it be done?
   - **Priority**: Low / Medium / High
   - **Related**: Select contact and/or deal
4. Click **Create task**

🔔 Overdue tasks are shown with a red indicator!

### 5. Log an Activity

To keep track of all communication:

1. Open a contact or deal
2. Click **Log activity**
3. Select type:
   - **Call** (📞): Log phone calls
   - **Email** (✉️): Log email communication
   - **Meeting** (📅): Log meetings
   - **Note** (📝): General notes
4. Fill in:
   - **Subject**: Brief description
   - **Duration**: How long did it take? (minutes)
   - **Outcome**: Select result (successful, follow-up needed, no answer, etc.)
   - **Notes**: Detailed notes
5. Click **Save activity**

📊 All activities are displayed in the timeline for the contact/deal.

### 6. Send an Email

1. Go to the **Emails** view
2. Click **Send email**
3. Compose the email:
   - **To**: Select recipient (contact)
   - **Subject** and **Content**
   - **CC/BCC**: Optional
4. **Optional**: 
   - Attach files (max 10 files, 25 MB total)
   - Use a template from the dropdown
   - Insert variables (e.g., {firstName}, {company})
   - Schedule for later sending
   - Set up recurring sending
5. Click **Send** or **Schedule**

**Email Features:**
- ✅ Automatic tracking of opens and clicks
- ✅ Save as template for future use
- ✅ Schedule emails for future sending
- ✅ Set up recurring emails (daily/weekly/monthly)
- ✅ Use variables for personalization
- ✅ Define custom variables
- ✅ Attach files with secure validation

### 7. Create an Email Template

1. In the **Emails** view, go to the **Templates** tab
2. Click **New template**
3. Fill in:
   - **Name**: Internal description (e.g., "Follow-up after meeting")
   - **Category**: Organization (e.g., "Follow-up")
   - **Subject**: Standard subject
   - **Content**: Standard message
4. Use **variables** for personalization:
   - `{firstName}` - First name
   - `{lastName}` - Last name
   - `{fullName}` - Full name
   - `{email}` - Email address
   - `{phone}` - Phone number
   - `{company}` - Company name
   - `{today}` - Today's date
   - Plus any custom variables!
5. Click **Save template**

### 8. Import Contacts from CSV

1. Go to **Contacts**
2. Click the **Import** button (top right)
3. **Download template** (recommended) to see the correct format
4. Drag the CSV file to the dialog or click to select
5. The system validates the data:
   - ✅ First name and last name are required
   - ✅ Email must be valid format
   - ✅ Duplicates based on email are prevented
6. Review any errors
7. Click **Import** to complete

💾 **CSV format for contacts:**
```csv
firstName,lastName,email,phone,company,status,tags,value,source,notes
John,Smith,john@example.com,555-0123,Acme Corp,lead,"customer;b2b",50000,Website,First contact from form
```

### 9. Export Data to CSV

For backup or analysis:

1. Go to **Contacts** or **Pipeline**
2. Click the **Export** button
3. The CSV file downloads automatically
4. Open in Excel, Google Sheets, or other spreadsheet

📦 All data is exported including tags, relationships, and metadata.

### 10. Set Up API Integrations

To connect the CRM to other systems:

1. Go to the **API** view
2. Select a tab:

**API Keys:**
1. Click **Create key**
2. Give it a name and description
3. Select permissions:
   - **Read**: Fetch data
   - **Write**: Create and update data
   - **Delete**: Remove data
   - **Admin**: Full access
4. Optional: Set expiry date and rate limit
5. Copy the key (shown only once!)

**Webhooks:**
1. Click **Create webhook**
2. Fill in:
   - **Name**: Internal description
   - **URL**: Where should events be sent?
   - **Events**: Select which events should trigger the webhook
3. Copy the secret for signature verification
4. Click **Test webhook** to verify

**Integrations:**
1. Select integration type (SMTP, SMS, Accounting, Calendar)
2. Select provider
3. Fill in configuration details
4. Click **Test connection**
5. Activate the integration

### 11. Test the API

**API Playground:**
1. Go to **API** → **Playground** tab
2. Select an endpoint from the dropdown
3. Enter your API key
4. Configure parameters or request body
5. Click **Send request**
6. View response, status code, and response time
7. Copy cURL command for external tools

**Authentication Testing:**
1. Go to **API** → **Auth Testing** tab
2. Select an API key to test
3. Click **Run test** for individual endpoints
4. Or click **Run all tests** for comprehensive validation
5. See which endpoints pass/fail based on permissions

---

## Advanced Features

### Scheduled and Recurring Emails

**Schedule an Email:**
1. Compose an email as usual
2. Below the composer, enable **Schedule sending**
3. Select date and time (minimum 5 minutes ahead)
4. Click **Schedule**
5. The email sends automatically at the specified time

**Recurring Emails:**
1. Compose an email
2. Enable **Schedule sending**
3. Select date and time
4. Enable **Recurring sending**
5. Select pattern:
   - **Daily**: Send every X day(s)
   - **Weekly**: Send every X week(s)
   - **Monthly**: Send every X month(s)
6. Select end condition:
   - **Never**: Continue indefinitely
   - **End date**: Stop after a specific date
   - **After X occurrences**: Stop after a number of sends
7. Click **Schedule**

📧 See all scheduled and recurring emails in the **Emails** view at the top.

### Custom Template Variables

To create your own variables beyond system variables:

1. Go to **Emails** → **Variables** tab
2. Click **New variable**
3. Fill in:
   - **Key**: Variable name (e.g., "projectname")
   - **Label**: Display name
   - **Description**: What is this?
   - **Example**: Example value
4. Use the variable in templates: `{projectname}`

**Import/Export Variables:**
- Click the menu at the top right
- **Export variables**: Download as JSON
- **Import variables**: Upload JSON file

### Filtering and Search

**Contacts:**
- Search: Type in the search field (searches name, email, company, tags)
- Tags: Filter by clicking on a tag

**Pipeline:**
- Click the filter button for advanced filters:
  - Minimum/maximum value
  - Date range
  - Specific contact
  - Search text
- Show/hide closed deals

**Tasks:**
- Filter by status (completed/not completed)
- Filter by priority
- Search in title and description

---

## Tips and Tricks

### 🚀 Productivity

1. **Use the keyboard**: Many dialogs can be navigated with Tab and Enter
2. **Tags for organization**: Use tags for quick categorization (e.g., "vip", "partner", "event2024")
3. **Template library**: Set up templates for common emails to save time
4. **Schedule emails**: Send emails at optimal times even if you work late
5. **Bulk import**: Use CSV import to add many contacts at once

### 📊 Reporting

1. **Dashboard**: Check the Dashboard every morning for an overview
2. **Activity metrics**: Track calls, emails, and meetings each week
3. **Conversion rate**: Monitor how many deals are won vs. total
4. **Email performance**: Monitor open rate and click rate to improve messages

### 🔒 Security

1. **API keys**: Create separate keys for each integration
2. **Permissions**: Give minimum necessary permissions
3. **Expiry dates**: Set expiry dates for temporary keys
4. **Regular export**: Export data regularly for backup

### 🔌 Integrations

1. **Webhooks for real-time sync**: Use webhooks to keep other systems updated
2. **SMTP for email**: Configure SMTP for professional email sending
3. **API for custom solutions**: Use the API to build custom integrations

---

## Support and Documentation

### Need More Help?

- **API Documentation**: Go to API → Documentation for detailed endpoint reference
- **API Playground**: Test API endpoints interactively
- **Authentication Testing**: Validate API key permissions
- **CSV Templates**: Download templates for proper import format

### Technical Support

For technical issues or questions:
1. Check the API documentation for endpoint details
2. Test integrations using the API playground
3. Validate permissions using authentication testing
4. Export data for backup before making major changes

---

## System Information

- **Language Support**: Norwegian (Bokmål) and English
- **Currency**: NOK (Norwegian Kroner)
- **Data Storage**: EU-compliant GDPR-ready storage
- **Export Format**: CSV (Excel/Google Sheets compatible)
- **API Rate Limit**: 1000 requests/hour per key
- **File Attachments**: Max 10 files, 25 MB total per email
- **Supported File Types**: PDF, Word, Excel, PowerPoint, TXT, CSV, Images, ZIP/RAR/7Z

---

**Norwegian CRM - Effektiv kundehåndtering for norske bedrifter** 🇳🇴
