FROM node:lts
ENV NODE_ENV=production
WORKDIR /app

RUN npm install -g typescript && corepack enable

COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["pnpm", "run", "start"]
