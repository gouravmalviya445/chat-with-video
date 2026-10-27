FROM oven/bun AS builder

WORKDIR /app

# copy all root config files
COPY package*.json turbo.json bun.lock* ./

# copy packages
COPY packages ./packages

# copy server
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/drizzle.config.ts ./apps/server/drizzle.config.ts

# install ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# install dependencies
RUN bun ci

COPY apps/server ./apps/server

WORKDIR /app/apps/server

EXPOSE 8000

CMD ["bun", "run", "docker:dev"]

