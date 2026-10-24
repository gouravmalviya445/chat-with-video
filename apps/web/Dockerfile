# stage 1: build the app
FROM oven/bun AS builder

WORKDIR /app

# copy all root config files
COPY package*.json turbo.json bun.lock* ./

COPY packages ./packages

COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json

RUN bun ci

COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN --mount=type=secret,id=web_env,target=.env bun run build

# stage 2: run the app
FROM oven/bun AS runner

WORKDIR /app/apps/web

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/packages ../../packages
COPY --from=builder /app/apps/web/package.json ./package.json

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "start"]


