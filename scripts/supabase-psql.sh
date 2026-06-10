#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

load_dotenv() {
  [[ -f "${ENV_FILE}" ]] || return 0

  while IFS= read -r line || [[ -n "${line}" ]]; do
    line="${line%$'\r'}"
    [[ -z "${line}" || "${line}" == \#* || "${line}" != *=* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"

    case "${key}" in
      SUPABASE_PROJECT_REF|SUPABASE_DB_HOST|SUPABASE_DB_PORT|SUPABASE_DB_NAME|SUPABASE_DB_USER|SUPABASE_DB_PASSWORD)
        if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
          value="${value:1:${#value}-2}"
        elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
          value="${value:1:${#value}-2}"
        fi
        export "${key}=${value}"
        ;;
    esac
  done < "${ENV_FILE}"
}

usage() {
  cat <<'EOF'
Usage:
  scripts/supabase-psql.sh [schema]

Examples:
  scripts/supabase-psql.sh
  scripts/supabase-psql.sh courts
  scripts/supabase-psql.sh dropins

The helper reads .env and expects:
  SUPABASE_DB_PASSWORD=...

Optional overrides:
  SUPABASE_PROJECT_REF=aeojyhopmxgtzedqughe
  SUPABASE_DB_HOST=db.aeojyhopmxgtzedqughe.supabase.co
  SUPABASE_DB_PORT=5432
  SUPABASE_DB_NAME=postgres
  SUPABASE_DB_USER=postgres
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

load_dotenv

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed or not on PATH." >&2
  echo "On macOS, install it with: brew install libpq && brew link --force libpq" >&2
  exit 127
fi

PROJECT_REF="${SUPABASE_PROJECT_REF:-aeojyhopmxgtzedqughe}"
DB_HOST="${SUPABASE_DB_HOST:-db.${PROJECT_REF}.supabase.co}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"
SCHEMA="${1:-}"

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "Missing SUPABASE_DB_PASSWORD. Add it to .env first." >&2
  exit 1
fi

if [[ -n "${SCHEMA}" ]]; then
  if [[ ! "${SCHEMA}" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "Invalid schema name: ${SCHEMA}" >&2
    exit 1
  fi
  export PGOPTIONS="-c search_path=${SCHEMA},public"
fi

export PGPASSWORD="${DB_PASSWORD}"

if [[ -n "${SCHEMA}" ]]; then
  echo "Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME} as ${DB_USER} with search_path=${SCHEMA},public"
else
  echo "Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME} as ${DB_USER}"
fi

exec psql "host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} sslmode=require"
