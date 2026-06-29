#!/usr/bin/env bash
# Local dev server for ShowSound.
# Mic access needs a secure context. file:// and plain http on a phone won't
# grant the mic, so for phone testing use the Vercel https URL instead.
# This server is fine for desktop Chrome testing on localhost.

cd "$(dirname "$0")/public" || exit 1
PORT="${1:-8080}"
echo "ShowSound dev server → http://localhost:${PORT}"
echo "Desktop Chrome on localhost can use the mic. For phone testing, deploy to Vercel."
python3 -m http.server "$PORT"
