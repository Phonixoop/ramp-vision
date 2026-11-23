# syntax=hub.megan.ir/docker/dockerfile:1
# =============================================================================
# ramp-vision — production image
#
#   docker build -t ramp-vision:latest .
#   docker run --rm -p 3000:3000 --env-file .env ramp-vision:latest
#
# Stages:
#   base    -> pinned Node + OS packages shared by every stage
#   deps    -> full dependency tree + generated Prisma client (cached layer)
#   builder -> `next build` output
#   runner  -> minimal runtime: prod deps only, non-root, tini as PID 1
#
# Debian slim (glibc) is deliberate: Prisma's engines and the native MSSQL
# driver (tedious/mssql) are far better tested on glibc than on musl/Alpine.
# =============================================================================

# Next 16 needs Node >= 20.9; package.json `engines` and .nvmrc pin 22.x.
ARG NODE_VERSION=24

# -----------------------------------------------------------------------------
# base
# -----------------------------------------------------------------------------
FROM hub.megan.ir/node:${NODE_VERSION}-bookworm-slim AS base

# openssl   -> Prisma engine/platform detection (libssl3)
# ca-certs  -> outbound TLS (NextAuth, API calls)
# tini      -> correct signal forwarding + zombie reaping as PID 1
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
        tini \
    && rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

# -----------------------------------------------------------------------------
# deps — full dependency tree (dev + prod) so `next build` has tailwind, postcss,
#        the prisma CLI, etc.
# -----------------------------------------------------------------------------
FROM base AS deps

# .npmrc must come along: it sets legacy-peer-deps=true (React 19 + legacy peers),
# without it `npm ci` fails on peer conflicts.
COPY package.json package-lock.json .npmrc ./

# prisma/ must exist before `npm ci`, because the root `postinstall` runs
# `prisma generate`.
COPY prisma ./prisma

# No application env vars are needed here: `prisma generate` reads the schema
# only and never resolves a datasource URL or opens a connection, so the image
# builds without any credentials. All real config is injected at run time.
RUN --mount=type=cache,target=/root/.npm \
    npm ci \
    # Re-run generation explicitly (the root postinstall already did it) so the
    # Linux query engine is guaranteed present even if lifecycle scripts were
    # skipped or cached. The client lands in node_modules/.prisma and is copied
    # into the runner stage below.
    && npx prisma generate

# -----------------------------------------------------------------------------
# builder — compile the app
# -----------------------------------------------------------------------------
FROM base AS builder

# next.config.mjs only skips ~/src/env.mjs validation when these are set.
# Scoped to this stage on purpose: the runtime stage MUST validate real env.
ENV NODE_ENV=production \
    SKIP_ENV_VALIDATION=true \
    DOCKER_BUILD=true \
    BUILD_ENV=docker

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Delete the compiler cache inside the builder: it is irrelevant at runtime and
# otherwise doubles what the runner stage has to COPY from this layer.
RUN npm run build \
    && rm -rf .next/cache

# -----------------------------------------------------------------------------
# runner — minimal runtime image
# -----------------------------------------------------------------------------
FROM base AS runner

# NODE_ENV is an invariant of a production image, not user config. All
# application configuration is injected at run time via `env_file: .env`
# (see docker-compose.prod.yml) or `docker run --env-file .env`.
ENV NODE_ENV=production

# Production dependencies only. --ignore-scripts is required because the root
# `postinstall` shells out to the `prisma` CLI, which is a devDependency and
# therefore absent here. The already-generated client is copied in below.
COPY package.json package-lock.json .npmrc ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# Generated Prisma client + linux query engine from the deps stage, so the
# runtime client matches the schema the image was built against. This is what
# makes --ignore-scripts above safe.
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next ./.next

# next.config.mjs is loaded at server start and it does `import("./src/env.mjs")`,
# so both files must exist here even though no other source is shipped.
COPY --chown=node:node --from=builder /app/next.config.mjs ./next.config.mjs
COPY --chown=node:node --from=builder /app/src/env.mjs ./src/env.mjs

# ISR / route-handler cache writes need this directory to exist and be writable
# by the non-root user (the build cache itself was dropped in the builder stage).
RUN mkdir -p .next/cache \
    && chown -R node:node .next

USER node

EXPOSE 3000

# Reads PORT from the environment (set in .env); defaults to 3000, and both the
# healthcheck and the server below use the same resolved value.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]

# Exec form straight onto the binary: going through `npm start` would put npm
# between tini and the server and swallow SIGTERM (10s+ slow shutdowns).
# `next start` reads PORT itself and defaults the host to 0.0.0.0.
CMD ["node_modules/.bin/next", "start"]
