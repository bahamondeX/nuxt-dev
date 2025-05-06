FROM node:20-alpine AS build-stage

WORKDIR /app
RUN corepack enable


COPY . .
RUN pnpm build

COPY --from=build-stage /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]