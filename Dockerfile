FROM python:3.11-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    AI_EDITOR_HOME=/opt/ai-editor \
    AI_EDITOR_LIBRARY=/library \
    AI_EDITOR_HOST=0.0.0.0 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROMIUM_PATH=/usr/bin/chromium \
    PATH="/opt/ai-editor/venv/bin:$PATH"

# Install system dependencies: FFmpeg, curl, Node.js 22 LTS, and Chromium runtime for Remotion
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    ffmpeg \
    git \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libasound2 \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application source code
COPY . /app

# Bootstrap dependencies (Python venv, whisper model, Remotion renderer) into /opt/ai-editor
RUN mkdir -p /opt/ai-editor /library /edits \
    && python3 plugins/ai-editor/skills/setup/scripts/setup.py bootstrap

RUN chmod +x /app/docker-entrypoint.sh

# Web UI Home port and Review server ports
EXPOSE 47821 47822-47835

VOLUME ["/library", "/edits"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["serve"]
