# ShowSound Roadmap

## Known limitations in v1

- **dB-SPL is estimated, not calibrated.** The meter maps mic RMS to an assumed
  reference (0 dBFS ≈ 94 dBSPL). Real SPL varies by phone mic. A calibration
  step (match against a known SPL source, or a per-device offset table) would
  make the hearing-dose feature trustworthy.
- **Latency.** Web Audio adds processing delay. With non-isolating earbuds you
  hear both the room directly and the delayed processed signal, which can sound
  doubled. Isolating IEMs or ANC earbuds in transparency-off mode largely fix
  this. Worth measuring round-trip latency per device.
- **iOS output routing.** iOS decides output routing; Web Audio can't force a
  specific device. Generally routes to connected earbuds automatically.
- **Background audio.** iOS may suspend audio when the screen locks. Keeping the
  app foregrounded is the simple v1 answer.

## Near-term features

- Save custom presets (localStorage) with user-named venue profiles.
- Auto-EQ: analyze the live spectrum and suggest corrective EQ.
- Cumulative hearing-dose tracking across a whole show (NIOSH/OSHA dose %).
- A real spectrum analyzer view (FFT bars) in addition to the waveform.
- Wet/dry mix so the user can blend processed and direct sound.

## Bigger bets

- Per-band Q control and a parametric EQ mode for power users.
- Latency compensation / measurement tool.
- Native wrapper (Capacitor) if PWA audio limits on iOS become blocking.
