# MI PERU Uploader

## Was das ist / warum

Der Postiz-Webbrowser skaliert Bilder beim Upload clientseitig herunter – große Fotos (über 4,5 MB) und Videos verlieren dadurch Qualität, bevor sie in der Mediathek landen. Der MI PERU Uploader löst dieses Problem: Das Team-Personal meldet sich mit einem gemeinsamen Passwort an, lädt Dateien in voller Originalauflösung hoch (über Vercel Blob), und eine Serverless-Funktion übergibt die Datei direkt per `upload-from-url` an Postiz – ohne dass der Browser die Datei jemals anfasst. Nach der Übernahme durch Postiz wird der temporäre Blob automatisch gelöscht; eine Verlaufs-Galerie (Thumbnails + Postiz-Link) bleibt in Vercel KV gespeichert.

---

## Lokal starten

```bash
npm install
```

Umgebungsvariablen einrichten (siehe [Abschnitt unten](#environment-variablen)):

```bash
cp .env.example .env.local
# .env.local befüllen
```

Entwicklungsserver starten:

```bash
npm run dev
# → http://localhost:3000
```

Tests und Build:

```bash
npm test        # Unit-Tests
npm run build   # Produktions-Build prüfen
```

---

## Environment-Variablen

Alle Variablen werden in `.env.local` (lokal) bzw. in **Project → Settings → Environment Variables** (Vercel) eingetragen.

| Variable | Beschreibung | Woher |
|---|---|---|
| `POSTIZ_API_KEY` | Postiz Public-API-Key | Postiz → **Einstellungen → Public API → Generate** |
| `POSTIZ_API_URL` | Basis-URL der Postiz Public API | Standard: `https://api.postiz.com/public/v1` — nur ändern, wenn nötig (z. B. Self-hosted) |
| `SHARED_PASSWORD` | Team-Passwort fürs Login | Frei wählbar; sicheres Passwort wählen |
| `SESSION_SECRET` | Langer Zufallsstring zum Signieren der Session | `openssl rand -base64 32` (Linux/Mac) oder PowerShell: `[Convert]::ToBase64String((1..32 \| % {Get-Random -Max 256}))` |
| `BLOB_READ_WRITE_TOKEN` | Zugriffstoken für den Vercel Blob-Store | Wird **automatisch gesetzt**, wenn im Vercel-Projekt ein Blob-Store angelegt wird |
| `KV_REST_API_URL` | REST-URL des Vercel KV-Stores | Wird **automatisch gesetzt**, wenn im Vercel-Projekt ein KV-Store angelegt wird |
| `KV_REST_API_TOKEN` | Zugriffstoken für den Vercel KV-Store | Wird **automatisch gesetzt**, wenn im Vercel-Projekt ein KV-Store angelegt wird |

---

## Auf Vercel deployen

1. **Projekt importieren** – In der Vercel-Oberfläche auf **Add New → Project** klicken und das Git-Repository (`miperu-uploader`) importieren. Framework: **Next.js** wird automatisch erkannt.

2. **Blob-Store anlegen** – Im Vercel-Projekt unter **Storage → Create Database → Blob** einen neuen Blob-Store erstellen und mit dem Projekt verbinden. Vercel setzt `BLOB_READ_WRITE_TOKEN` danach automatisch als Umgebungsvariable.

3. **KV-Store anlegen** – Im Vercel-Projekt unter **Storage → Create Database → KV** einen neuen KV-Store erstellen und verbinden. Vercel setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN` automatisch.

4. **Weitere Umgebungsvariablen eintragen** – Unter **Project → Settings → Environment Variables** folgende Variablen hinzufügen:
   - `POSTIZ_API_KEY` (aus Postiz → Einstellungen → Public API)
   - `POSTIZ_API_URL` (Standard: `https://api.postiz.com/public/v1`)
   - `SHARED_PASSWORD` (frei gewähltes Team-Passwort)
   - `SESSION_SECRET` (langer Zufallsstring, s. oben)

5. **Deployen** – **Deploy** klicken. Vercel baut das Projekt und stellt es unter der Projekt-URL bereit. Build-Log auf Fehler prüfen.

---

## Nach dem Deploy testen

Kern-Abnahme nach dem ersten Deployment:

1. Deployed URL öffnen → Weiterleitung auf `/login` bestätigen.
2. Falsches Passwort eingeben → Fehlermeldung „Falsches Passwort" erscheint. Richtiges Passwort → Upload-Seite wird angezeigt.
3. Ein **großes Foto (> 4,5 MB)** und ein **MP4-Video** hochladen.
4. In **Postiz → Mediathek** prüfen: Beide Dateien sind vorhanden, und das Bild hat die **Originalauflösung** (Pixelabmessungen mit der Quelldatei vergleichen – das ist das zentrale Abnahmekriterium).
5. In der **Verlaufs-Galerie** des Uploaders: Thumbnails beider Uploads prüfen; „Postiz-Link kopieren" klicken und sicherstellen, dass ein gültiger Pfad in die Zwischenablage kopiert wird.
6. Im **Vercel Blob-Dashboard** prüfen: Die Original-Blobs wurden nach der Übergabe an Postiz automatisch gelöscht – es verbleiben nur Thumbnails.

---

## Hinweise

- **`next@15.1.6`** enthält bekannte CVEs und sollte vor dem Produktivbetrieb auf eine gepatchte Version aktualisiert werden (`npm update next` und Changelog prüfen).
- **`@vercel/kv`** ist von Vercel deprecated (Nachfolger: Upstash-SDK direkt). Das Paket funktioniert weiterhin, sollte aber langfristig migriert werden, um Kompatibilitätsprobleme zu vermeiden.
