#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_CANDIDATES=(
  ".venv/bin/activate"
  "venv/bin/activate"
  "../.venv/bin/activate"
  "../venv/bin/activate"
)

for activate_script in "${VENV_CANDIDATES[@]}"; do
  if [ -f "$activate_script" ]; then
    # shellcheck disable=SC1090
    source "$activate_script"
    break
  fi
done

export FLASK_ENV=development
export FLASK_DEBUG=1

exec python3 app.py
