# ---- build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# CI-friendly env
ENV HUSKY=0
ENV CI=true

# Use pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Accept (optional) build-time public URL for Remix/Vite (Coolify can pass it)
ARG VITE_PUBLIC_APP_URL
ENV VITE_PUBLIC_APP_URL=${VITE_PUBLIC_APP_URL}

# Install deps efficiently
COPY package.json pnpm-lock.yaml* ./
RUN pnpm fetch

# Copy source and build
COPY . .
# install with dev deps (needed to build)
RUN pnpm install --offline --frozen-lockfile

# Build the Remix app (SSR + client)
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm run build

# Keep only production deps for runtime
RUN pnpm prune --prod --ignore-scripts


# ---- runtime stage ----
FROM node:22-bookworm-slim AS gitmesh-ai-production
WORKDIR /app

ENV NODE_ENV=production

# Install curl and wrangler dependencies
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Use pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copy only what we need to run
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/bindings.sh /app/bindings.sh
COPY --from=build /app/wrangler.toml /app/wrangler.toml
COPY --from=build /app/functions /app/functions

# Make bindings.sh executable
RUN chmod +x /app/bindings.sh

# Cloud Run provides PORT env var, default to 8080
ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/ || exit 1

# Start wrangler pages dev for production
CMD bindings=$(./bindings.sh) && pnpm wrangler pages dev ./build/client $bindings --ip 0.0.0.0 --port ${PORT} --no-show-interactive-dev-session


# ---- development stage ----
FROM build AS gitmesh-ai-development

# Define environment variables for development
ARG GROQ_API_KEY
ARG HuggingFace_API_KEY
ARG OPENAI_API_KEY
ARG ANTHROPIC_API_KEY
ARG OPEN_ROUTER_API_KEY
ARG GOOGLE_GENERATIVE_AI_API_KEY
ARG OLLAMA_API_BASE_URL
ARG XAI_API_KEY
ARG TOGETHER_API_KEY
ARG TOGETHER_API_BASE_URL
ARG VITE_LOG_LEVEL=debug
ARG DEFAULT_NUM_CTX

ENV GROQ_API_KEY=${GROQ_API_KEY} \
    HuggingFace_API_KEY=${HuggingFace_API_KEY} \
    OPENAI_API_KEY=${OPENAI_API_KEY} \
    ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} \
    OPEN_ROUTER_API_KEY=${OPEN_ROUTER_API_KEY} \
    GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY} \
    OLLAMA_API_BASE_URL=${OLLAMA_API_BASE_URL} \
    XAI_API_KEY=${XAI_API_KEY} \
    TOGETHER_API_KEY=${TOGETHER_API_KEY} \
    TOGETHER_API_BASE_URL=${TOGETHER_API_BASE_URL} \
    AWS_BEDROCK_CONFIG=${AWS_BEDROCK_CONFIG} \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    DEFAULT_NUM_CTX=${DEFAULT_NUM_CTX} \
    RUNNING_IN_DOCKER=true

RUN mkdir -p /app/run
CMD ["pnpm", "run", "dev", "--host"]
