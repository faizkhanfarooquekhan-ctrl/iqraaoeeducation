#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5173}"
HOST="127.0.0.1"

if curl -fsS "http://${HOST}:${PORT}/health" >/dev/null 2>&1; then
  echo "IQRA AOE dev server already listening on ${PORT}"
  exit 0
fi

SESSION="iqra_dev"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=${SESSION}" 2>/dev/null ||
  tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION" -c /workspace -- "${SHELL:-bash}" -l

tmux -f /exec-daemon/tmux.portal.conf send-keys -t "${SESSION}:0.0" \
  "cd /workspace && exec npm run dev" C-m

for _ in $(seq 1 60); do
  if curl -fsS "http://${HOST}:${PORT}/health" >/dev/null 2>&1; then
    echo "IQRA AOE dev server ready on port ${PORT}"
    exit 0
  fi
  sleep 0.5
done

echo "Dev server did not become ready; check tmux session ${SESSION}" >&2
exit 1
