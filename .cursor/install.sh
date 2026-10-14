#!/usr/bin/env bash
set -euo pipefail
cd /workspace

npm ci
if [ -f appsscript.json ]; then
  npm run validate:manifest
fi
