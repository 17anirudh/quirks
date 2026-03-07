FROM oven/bun:canary-alpine
WORKDIR /
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY . .
EXPOSE 5000
CMD ["bun", "run", "src/index.ts"]