#!/usr/bin/env bash
set -e

# Setup creator-teardown config from environment
mkdir -p "$HOME/.config/creator-teardown"
cat << EOF > "$HOME/.config/creator-teardown/.env"
GEMINI_BASE_URL=${GEMINI_BASE_URL:-http://host.docker.internal:20128}
GEMINI_API_VERSION=${GEMINI_API_VERSION:-v1beta}
GEMINI_AUTH_MODE=${GEMINI_AUTH_MODE:-bearer}
GEMINI_MODEL=${GEMINI_MODEL:-ag/gemini-3.8-flash-high}
GEMINI_FRAME_SAMPLING=${GEMINI_FRAME_SAMPLING:-1}
GEMINI_API_KEY=${GEMINI_API_KEY:-FlashVeditor}
EOF
chmod 600 "$HOME/.config/creator-teardown/.env"

# Setup Claude Code settings if token provided
if [ -n "$ANTHROPIC_API_KEY" ] || [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
  TOKEN="${ANTHROPIC_AUTH_TOKEN:-$ANTHROPIC_API_KEY}"
  BASE="${ANTHROPIC_BASE_URL:-http://host.docker.internal:20128}"
  mkdir -p "$HOME/.claude" /app/.claude
  cat << EOF > "$HOME/.claude/settings.local.json"
{
  "env": {
    "ANTHROPIC_BASE_URL": "$BASE",
    "ANTHROPIC_API_KEY": "$TOKEN",
    "ANTHROPIC_AUTH_TOKEN": "$TOKEN",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "${ANTHROPIC_DEFAULT_HAIKU_MODEL:-ag/gemini-3.8-flash-high}",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "${ANTHROPIC_DEFAULT_SONNET_MODEL:-ag/claude-sonnet-4-6}",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "${ANTHROPIC_DEFAULT_OPUS_MODEL:-ag/claude-opus-4-6-thinking}"
  }
}
EOF
  cp "$HOME/.claude/settings.local.json" /app/.claude/settings.local.json 2>/dev/null || true
fi

# Ensure library and data folders exist
mkdir -p "${AI_EDITOR_LIBRARY:-/library}" "${AI_EDITOR_HOME:-/data}"

# If command is "serve" or empty, start home web UI
if [ "$#" -eq 0 ] || [ "$1" = "serve" ]; then
  echo "=========================================================="
  echo " FlashVeditor Home Server starting..."
  echo " Host: ${AI_EDITOR_HOST:-0.0.0.0}"
  echo " Port: 47821"
  echo " 9Router: ${GEMINI_BASE_URL:-http://host.docker.internal:20128}"
  echo " Model: ${GEMINI_MODEL:-ag/gemini-3.8-flash-high}"
  echo "=========================================================="
  # Start Auto-Worker in background
  python3 plugins/ai-editor/lib/ai_editor/worker.py &
  exec python3 plugins/ai-editor/lib/ai_editor/home.py serve --no-open --port 47821
fi

exec "$@"
