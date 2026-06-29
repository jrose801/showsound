# ShowSound

Real-time EQ and hearing protection for live shows. Captures room sound through
your phone's mic, applies a 5-band equalizer and a hearing-safe dB limiter, and
plays the result through your earbuds — like a smart in-ear monitor for concerts.

Built as an installable PWA. All audio is processed on-device via the Web Audio
API. Nothing is recorded or uploaded.

## Project structure

```
showsound/
├── public/
│   ├── index.html        # The whole app (UI + audio engine)
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker (offline shell cache)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── vercel.json           # Deploy config
├── serve.sh              # Local dev server (desktop testing)
├── .gitignore
└── README.md
```

## The one thing to know about the mic

Microphone access requires a **secure context**. That means:

- ✅ `https://` (your Vercel URL) — works on phone and desktop
- ✅ `http://localhost` — works on desktop Chrome only
- ❌ `file://` opened directly — mic blocked on iOS, flaky elsewhere
- ❌ inside an embedded preview frame — mic always blocked

So for real phone testing, you must deploy to Vercel (or any https host) and
open that URL on your phone.

## Local testing (desktop)

```bash
./serve.sh
# then open http://localhost:8080 in Chrome, plug in earbuds, click Start
```

## Deploy to Vercel

This mirrors your existing HeyJop workflow (GitHub → Vercel auto-deploy).

1. Create a new GitHub repo and push this folder:
   ```bash
   cd showsound
   git init
   git add .
   git commit -m "ShowSound: initial PWA"
   git branch -M main
   git remote add origin https://github.com/jrose801/showsound.git
   git push -u origin main
   ```
2. In Vercel: New Project → import the `showsound` repo.
3. Framework preset: **Other**. Root directory: leave as repo root.
   Output/static directory: `public`.
4. Deploy. You'll get an `https://showsound-xxxx.vercel.app` URL.
5. Open that URL on your phone, plug in earbuds, tap **Enable Mic & Start**.

After the first deploy, every `git push` auto-deploys, same as HeyJop.

## Install to home screen (real PWA)

- **iOS Safari:** open the Vercel URL → Share → Add to Home Screen.
- **Android Chrome:** open the URL → menu → Install app.

## Current state (v1)

Working: live mic capture, 5-band EQ that audibly changes sound, real RMS dB
metering, hard limiter (DynamicsCompressor), venue presets, hearing-dose timer,
offline app shell.

Approximate / needs work: dB-SPL calibration is a rough estimate, not a true
SPL reading. Latency depends on device and earbud type. See ROADMAP.md.
