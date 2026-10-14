#!/usr/bin/env bash
set -euo pipefail
cd /workspace

npm ci
npm run validate:manifest
