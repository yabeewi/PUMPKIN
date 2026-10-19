# Halloween Pumpkin Hunt — English / 30 Pumpkins

This version keeps the existing offline-first structure and expands the collection from 10 to 30 pumpkins.

## Changes in this version

1. All student-facing and teacher-tool text is in English.
2. The pumpkin collection now contains 30 characters.
3. Pumpkin IDs and codes 1–10 are unchanged, so the original 10 QR Codes remain compatible.
4. New pumpkins 11–30 have unique IDs and codes.
5. Offline caching, localStorage progress, QR scanning, fallback rendering, and WebGL rendering are unchanged in structure.
6. The cache version is updated to `v5.0-en-30` so devices do not remain stuck on the older files.

## Test locally on Windows

After extracting the folder, double-click `START_HERE.bat`.

Home: `http://localhost:8000/`

Teacher test page: `http://localhost:8000/offline-test.html`

## iPad offline use

The deployed website must use HTTPS. Before the activity, open the home page on each iPad while online and wait until it shows:

`✅ Offline mode is ready`

Then turn off Wi-Fi and test 1–2 pumpkin QR Codes.

## QR Codes

Open `qr-tool.html`, enter the public website base URL, and generate all 30 QR Codes.
