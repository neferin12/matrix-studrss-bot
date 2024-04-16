FROM node:lts as base
RUN corepack enable

FROM base as builder
WORKDIR /app
COPY ["package.json", "pnpm-lock.yaml", "./"]
RUN pnpm install

COPY . .

RUN pnpm run build

FROM base as runtime
ENV NODE_ENV=production

WORKDIR /app
COPY ["package.json", "pnpm-lock.yaml", "./"]
RUN pnpm install --prod

COPY --from=builder /app/dist /app/dist

CMD ["node", "."]
