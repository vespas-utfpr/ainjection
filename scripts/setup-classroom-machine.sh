#!/usr/bin/env bash
set -euo pipefail

# Bootstrap para maquinas da sala (frontend local + backend compartilhado Supabase)
# Uso:
#   ./scripts/setup-classroom-machine.sh --url https://xxx.supabase.co --key eyJ...
#   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... ./scripts/setup-classroom-machine.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
DO_INSTALL=1
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_PUBLISHABLE_KEY="${SUPABASE_PUBLISHABLE_KEY:-}"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/setup-classroom-machine.sh [opcoes]

Opcoes:
  --url <value>          Valor de VITE_SUPABASE_URL
  --key <value>          Valor de VITE_SUPABASE_PUBLISHABLE_KEY
  --skip-install         Nao executa npm install
  -h, --help             Mostra esta ajuda

Tambem aceita variaveis de ambiente:
  SUPABASE_URL
  SUPABASE_PUBLISHABLE_KEY
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      SUPABASE_URL="${2:-}"
      shift 2
      ;;
    --key)
      SUPABASE_PUBLISHABLE_KEY="${2:-}"
      shift 2
      ;;
    --skip-install)
      DO_INSTALL=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Opcao invalida: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$SUPABASE_URL" ]]; then
  read -r -p "VITE_SUPABASE_URL: " SUPABASE_URL
fi

if [[ -z "$SUPABASE_PUBLISHABLE_KEY" ]]; then
  read -r -p "VITE_SUPABASE_PUBLISHABLE_KEY: " SUPABASE_PUBLISHABLE_KEY
fi

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_PUBLISHABLE_KEY" ]]; then
  echo "Erro: URL e chave publishable sao obrigatorias." >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$ENV_FILE.bak.$(date +%Y%m%d%H%M%S)"
fi

cat > "$ENV_FILE" <<EOF
VITE_SUPABASE_URL="$SUPABASE_URL"
VITE_SUPABASE_PUBLISHABLE_KEY="$SUPABASE_PUBLISHABLE_KEY"
EOF

echo "Arquivo .env atualizado em: $ENV_FILE"

if [[ $DO_INSTALL -eq 1 ]]; then
  cd "$ROOT_DIR"
  npm install
  echo "Dependencias instaladas."
fi

cat <<'EOF'
Setup concluido.

Proximo passo:
  npm run dev
EOF
