FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git \
    && corepack enable

COPY . .

RUN pnpm install
RUN pnpm build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]