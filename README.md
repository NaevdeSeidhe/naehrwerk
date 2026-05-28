# Nährwerk — evidenzbasierter Lebensmittel-Explorer

Interaktiver Explorer für 328 Lebensmittel mit Nährwerten (Schweizer Nährwertdatenbank + USDA)
und Gesundheitswirkungen, die nach Evidenz-Stufen A–D eingeordnet sind. Statische Web-App,
**kein Build-Step**, reine ES-Module + D3.js.

## Lokal starten

`fetch()` und ES-Module laufen nicht über `file://`, also über einen lokalen Server öffnen:

```bash
python3 -m http.server 8765
# dann http://localhost:8765/ öffnen
```

## Deployment (GitHub + Netlify)

Diese App ist zu 100 % statisch — keine Datenbank, kein Backend, kein Build.

1. Inhalt dieses Ordners in ein Git-Repo legen und pushen.
2. In Netlify das Repo verbinden. Build command **leer**, Publish directory auf den
   Ordner mit `index.html` (dieses Verzeichnis) setzen.
3. Fertig. `_headers` und `netlify.toml` setzen die Sicherheits-Header automatisch.

Liegt dieser Ordner als Unterordner in einem größeren Repo, in den Netlify-Settings
„Base directory"/„Publish directory" entsprechend setzen.

## Sicherheit

- **Content-Security-Policy** (`script-src 'self'`, kein `unsafe-inline` für Skripte) —
  blockiert eingeschleuste Skripte/Event-Handler. Gesetzt per HTTP-Header (`_headers`)
  und als `<meta>`-Fallback in `index.html`.
- Weitere Header: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, COOP/CORP, HSTS.
- Untrusted Eingaben (Lebensmittelname aus der URL) werden vor der DOM-Ausgabe escaped.
- **Keine externen Requests:** Schriftart (Inter) und D3.js sind lokal gehostet —
  keine Daten gehen an Dritt-CDNs (relevant für DSG/DSGVO).
- Kein Tracking, keine Cookies, kein Backend, keine Secrets im Code.

## Daten & Quellen

Der Datensatz (`data/healthdata_master.json`, Stand 2026-05-28) ist eine eigenständige,
transformierte Zusammenstellung. Die Gesundheitswirkungen und ihre Evidenz-Einordnung
wurden teilweise selbst recherchiert; die Nährwerte stammen aus zwei amtlichen Datenbanken:

| Quelle | Beitrag | Lizenz / Nutzung |
|---|---|---|
| **Schweizer Nährwertdatenbank (BLV/FSVO)** — [naehrwertdaten.ch](https://naehrwertdaten.ch), [opendata.swiss](https://opendata.swiss/de/dataset/naehrwerte_lebensmittel) | Nährwerte (Priorität 1) | **„Freie Nutzung. Quellenangabe ist Pflicht."** — kommerzielle Nutzung & Weiterverbreitung erlaubt, Quellenangabe verpflichtend |
| **USDA FoodData Central** — [fdc.nal.usda.gov](https://fdc.nal.usda.gov) | Nährwerte (Vergleichswerte) | Public Domain (US-Behördenwerk) |
| **EFSA / EU-Register (VO 432/2012)** | autorisierte Health Claims (Tier A) | öffentliches EU-Register |
| **WHO-IARC, WCRF** | Krebs-/Risiko-Klassifikation (Tier B) | Klassifikations-Fakten |
| **SIGHI** — histaminintoleranz.ch | Histamin-Einordnung | Klassifikations-Fakten |

Evidenz-Stufen: **A** EFSA-autorisiert · **B** WHO-IARC/WCRF/Cochrane/Meta · **C** vorläufig ·
**D** unbelegt/traditionell (transparent gekennzeichnet).

> Die Schweizer Nährwertdatenbank ist auf opendata.swiss unter „Freie Nutzung.
> Quellenangabe ist Pflicht." veröffentlicht — Weiterverbreitung und kommerzielle
> Nutzung sind ausdrücklich erlaubt, einzige Auflage ist die Quellenangabe. Diese ist
> in der Fußzeile der App sowie hier erfüllt. (Keine Rechtsberatung.)

## Lizenz & Credits

- **Code:** MIT (siehe `LICENSE`), © 2026 dionysos
- **Daten:** siehe Tabelle oben (NICHT MIT — eigene Quellen-Bedingungen)
- **Schrift:** Inter (SIL OFL 1.1), lokal gehostet
- **Bibliothek:** D3.js v7 (ISC), lokal gehostet
- Web-App erstellt mit [Claude Code](https://claude.com/claude-code).
