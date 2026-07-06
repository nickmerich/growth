#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs JS dependencies so `npm run build` / dev / preview work immediately.
set -euo pipefail

# Only needed in the remote (web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Idempotent + leverages the cached container layer (install, not ci).
npm install --no-audit --no-fund
