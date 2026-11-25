#!/bin/bash
# NUZUL — run every test suite against a local copy of this repository and print one summary line per suite.
# Usage: tests/run-all.sh [output-folder]        (needs python3, node, Chrome, and puppeteer-core; see tests/README.md)
# Exit code: 0 when every suite passes, 1 otherwise. The full output of each suite is kept in the output folder.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/tests/.out}"
PORT="${PORT:-8765}"
mkdir -p "$OUT"
cd "$ROOT" || exit 1
python3 -m http.server "$PORT" --bind 127.0.0.1 > "$OUT/server.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
fail=0
if git rev-parse --git-dir > /dev/null 2>&1; then COMMIT="$(git rev-parse HEAD)$(git diff --quiet HEAD -- . || echo ' + uncommitted changes')"; else COMMIT="not a git checkout"; fi
# SUITES="wording unicode" tests/run-all.sh   runs only the named suites
for s in ${SUITES:-wording functional search destinations security probes timezones unicode storage}; do
  f="$OUT/$s.txt"
  { echo "### suite: tests/$s.js"; echo "### commit: $COMMIT"; echo "### started: $(date '+%Y-%m-%d %H:%M:%S %Z')"; } > "$f"
  if [ "$s" = "wording" ]; then node tests/wording.js "$ROOT" >> "$f" 2>&1; code=$?
  else BASE="http://127.0.0.1:$PORT" node "tests/$s.js" >> "$f" 2>&1; code=$?; fi
  { echo "### finished: $(date '+%Y-%m-%d %H:%M:%S %Z')"; echo "### exit code: $code"; } >> "$f"
  [ "$code" -ne 0 ] && fail=1
  printf '%-13s exit=%s  %s\n' "$s" "$code" "$(grep -E '^total |^tested |^BAD ' "$f" | tr '\n' ' ' | cut -c1-110)"
done
exit $fail
