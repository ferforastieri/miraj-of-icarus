FROM node:24.18.0-bookworm-slim AS dependencies
WORKDIR /app
COPY portal/web/package.json portal/web/package-lock.json ./
RUN npm ci

FROM node:24.18.0-bookworm-slim AS build
WORKDIR /app
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1 \
    MIRAJ_OF_ICARUS_STANDALONE_BUILD=true \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
COPY --from=dependencies /app/node_modules ./node_modules
COPY portal/web/ .
RUN npm run build

FROM node:24.18.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
EXPOSE 3000
RUN chown node:node /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
CMD ["node", "server.js"]
