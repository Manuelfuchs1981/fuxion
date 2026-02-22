# Fuxion — Live Schalten: Schritt-für-Schritt Anleitung

> **Zeitaufwand:** ca. 45–60 Minuten beim ersten Mal  
> **Kosten:** Gratis (Vercel Free + Supabase Free reichen für den Start)

---

## Was du am Ende hast

- ✅ Fuxion läuft unter einer echten URL (z.B. `fuxion.vercel.app`)
- ✅ Login / Registrierung funktioniert
- ✅ Datenbank läuft auf Supabase (Schweiz-nah, Frankfurt)
- ✅ Automatisches Deployment bei jedem Code-Push

---

## Voraussetzungen (einmalig installieren)

### 1. Node.js installieren

Gehe auf **https://nodejs.org** → Download **LTS Version** → Installieren.

Danach im Terminal prüfen:
```
node --version   → sollte v20 oder höher zeigen
npm --version    → sollte v10 oder höher zeigen
```

**Terminal öffnen:**
- Mac: `Cmd + Leertaste` → „Terminal" → Enter
- Windows: `Windows-Taste` → „cmd" oder „PowerShell" → Enter

### 2. Git installieren

Gehe auf **https://git-scm.com/downloads** → Installieren.

Danach prüfen:
```
git --version   → sollte eine Versionsnummer zeigen
```

---

## Teil 1: Supabase einrichten (Datenbank + Auth)

### Schritt 1.1 — Konto erstellen

1. Gehe auf **https://supabase.com**
2. Klicke **Start your project** → Mit GitHub anmelden (empfohlen)
3. E-Mail bestätigen falls nötig

### Schritt 1.2 — Neues Projekt erstellen

1. Klicke **New Project**
2. Ausfüllen:
   - **Name:** `fuxion`
   - **Database Password:** Starkes Passwort wählen und irgendwo speichern!
   - **Region:** `Frankfurt (eu-central-1)` ← wichtig für Schweizer Kunden
3. Klicke **Create new project**
4. Warten bis das Projekt bereit ist (ca. 1–2 Minuten)

### Schritt 1.3 — API Keys kopieren

1. Im Supabase Dashboard: Linke Leiste → **Settings** (Zahnrad unten)
2. → **API**
3. Zwei Werte kopieren und aufschreiben:
   - **Project URL** → sieht aus wie `https://abcdefgh.supabase.co`
   - **anon public** Key → langer String unter „Project API keys"

### Schritt 1.4 — Datenbank Schema anlegen

1. Im Supabase Dashboard: Linke Leiste → **SQL Editor**
2. Klicke **New query**
3. Kopiere das gesamte SQL aus der Datei `fuxion_supabase_schema.sql` ins Textfeld
4. Klicke **Run** (oder `Cmd/Ctrl + Enter`)
5. Du solltest sehen: „Success. No rows returned"

### Schritt 1.5 — Auth konfigurieren

1. Linke Leiste → **Authentication** → **URL Configuration**
2. Unter **Redirect URLs** eintragen:
   - `http://localhost:3000/auth/callback` (für lokale Entwicklung)
   - Später noch: `https://DEINE-VERCEL-URL.vercel.app/auth/callback`
3. Speichern

---

## Teil 2: Projekt lokal einrichten

### Schritt 2.1 — Projektordner öffnen

Öffne das Terminal und navigiere zu dem Ordner wo du das Projekt hast:

```bash
cd /Pfad/zum/fuxion-app
```

Beispiel Mac/Linux:
```bash
cd ~/Downloads/fuxion-app
```

Beispiel Windows:
```bash
cd C:\Users\Max\Downloads\fuxion-app
```

### Schritt 2.2 — Abhängigkeiten installieren

```bash
npm install
```

Das dauert ca. 1–2 Minuten. Du siehst viel Text — das ist normal.

### Schritt 2.3 — Umgebungsvariablen einrichten

1. Im Projektordner findest du eine Datei `.env.local.example`
2. Kopiere diese Datei und benenne die Kopie `.env.local`

Mac/Linux:
```bash
cp .env.local.example .env.local
```

Windows:
```bash
copy .env.local.example .env.local
```

3. Öffne `.env.local` mit einem Texteditor (z.B. VS Code, Notepad)
4. Ersetze die Platzhalter mit deinen Werten aus Schritt 1.3:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Speichern

### Schritt 2.4 — Lokal starten

```bash
npm run dev
```

Jetzt öffne **http://localhost:3000** im Browser.  
Du solltest die Fuxion Login-Seite sehen! 🎉

**Test:** Registriere einen Account und melde dich an.

---

## Teil 3: Auf Vercel deployen (öffentliche URL)

### Schritt 3.1 — GitHub Konto erstellen (falls noch nicht)

Gehe auf **https://github.com** → Sign up

### Schritt 3.2 — Repository erstellen

1. Nach dem Login auf GitHub: Klicke **+** oben rechts → **New repository**
2. Name: `fuxion`
3. Private auswählen (dein Code bleibt privat)
4. **Create repository**

### Schritt 3.3 — Code hochladen

Im Terminal im Projektordner:

```bash
git init
git add .
git commit -m "Initial commit: Fuxion App"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/fuxion.git
git push -u origin main
```

Ersetze `DEIN-USERNAME` mit deinem GitHub Benutzernamen.  
Du wirst nach deinem GitHub Passwort gefragt (oder einem Token).

### Schritt 3.4 — Vercel Konto erstellen

1. Gehe auf **https://vercel.com**
2. Klicke **Sign Up** → **Continue with GitHub**
3. GitHub-Zugriff erlauben

### Schritt 3.5 — Projekt importieren

1. Auf Vercel Dashboard: Klicke **Add New... → Project**
2. Wähle dein `fuxion` Repository aus der Liste
3. Klicke **Import**
4. Framework wird automatisch als **Next.js** erkannt ✓
5. **NOCH NICHT DEPLOYEN** — zuerst Umgebungsvariablen eintragen!

### Schritt 3.6 — Umgebungsvariablen bei Vercel eintragen

Auf der Importseite, klappe den Bereich **Environment Variables** auf:

Trage diese drei Variablen ein:

| Name | Wert |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` (dein Anon Key) |
| `NEXT_PUBLIC_APP_URL` | `https://fuxion.vercel.app` (deine künftige URL) |

Die genaue Vercel-URL siehst du erst nach dem Deploy — du kannst den APP_URL auch später anpassen.

### Schritt 3.7 — Deployen

Klicke **Deploy**.

Vercel baut jetzt die App (ca. 2–3 Minuten). Du siehst Live-Logs.  
Am Ende: grünes Häkchen und deine URL, z.B. `fuxion-xyz.vercel.app`

### Schritt 3.8 — Supabase Redirect URL ergänzen

Jetzt kennst du deine echte URL. Zurück zu Supabase:

1. **Authentication** → **URL Configuration**
2. Unter **Redirect URLs** auch eintragen:
   `https://fuxion-xyz.vercel.app/auth/callback`
3. Speichern

---

## Teil 4: Eigene Domain einrichten (optional)

Wenn du eine Domain wie `app.musterfirma.ch` hast:

### Schritt 4.1 — Domain bei Vercel hinzufügen

1. Vercel Dashboard → dein Projekt → **Settings** → **Domains**
2. Deine Domain eingeben → **Add**
3. Vercel zeigt dir DNS-Einträge an

### Schritt 4.2 — DNS konfigurieren

Bei deinem Domain-Anbieter (z.B. Hostpoint, Infomaniak, Namecheap):
- CNAME-Eintrag für `app` → `cname.vercel-dns.com` erstellen
- Oder A-Record falls Vercel das angibt

DNS-Änderungen dauern 5 Minuten bis 24 Stunden.

### Schritt 4.3 — Supabase URL aktualisieren

Nicht vergessen: In Supabase die neue Domain als Redirect URL hinzufügen.

---

## Teil 5: Updates deployen

Wenn du Änderungen am Code machst:

```bash
git add .
git commit -m "Kurze Beschreibung der Änderung"
git push
```

Vercel deployed automatisch innerhalb von ~2 Minuten. Du bekommst eine E-Mail wenn es fertig ist.

---

## Häufige Probleme

### „Module not found" beim Build
```bash
npm install
```
Dann nochmal committen und pushen.

### Login funktioniert nicht
- Prüfe ob `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` korrekt gesetzt sind
- Prüfe ob die Redirect URL in Supabase eingetragen ist

### „Environment variable not set" Fehler
- Vercel Dashboard → Projekt → Settings → Environment Variables
- Variable prüfen/ergänzen
- Danach: Vercel → Deployments → **Redeploy**

### Seite zeigt nur Loading
- Supabase Projekt läuft noch (nach Inaktivität wird es pausiert)
- Supabase Dashboard öffnen → Projekt **Resume** klicken

---

## Nächste Schritte nach dem Launch

1. **Eigene Domain** (`app.musterfirma.ch`) — macht professionelleren Eindruck
2. **Supabase Pro** (CHF 25/Monat) — wenn mehr als 500 MB Daten oder tägliche Backups nötig
3. **Echte Daten** in die App bauen — die Seiten zeigen noch Platzhalter, jetzt können wir die Screens mit echten Supabase-Abfragen verbinden
4. **E-Mail Templates** in Supabase anpassen (Authentication → Email Templates)

---

## Übersicht alle Dateien im Projekt

```
fuxion-app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx     ← Login + Registrierung
│   │   │   └── callback/route.ts  ← E-Mail Bestätigung
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         ← Sidebar für Dashboard
│   │   │   └── page.tsx           ← KPI Übersicht
│   │   ├── rechnungen/            ← Rechnungen (Seite + Layout)
│   │   ├── offerten/
│   │   ├── journal/
│   │   ├── banking/
│   │   ├── reporting/
│   │   ├── kontakte/
│   │   ├── mwst/
│   │   ├── einstellungen/
│   │   ├── layout.tsx             ← Root Layout (Fonts, Meta)
│   │   ├── page.tsx               ← Redirect zu Dashboard/Login
│   │   └── globals.css            ← Tailwind CSS
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx        ← Navigation
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts          ← Browser Supabase Client
│   │       └── server.ts          ← Server Supabase Client
│   └── middleware.ts              ← Route Protection (Auth Guard)
├── .env.local                     ← GEHEIM — nie committen!
├── .env.local.example             ← Template für neue Entwickler
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

*Erstellt für Fuxion · Februar 2025*
