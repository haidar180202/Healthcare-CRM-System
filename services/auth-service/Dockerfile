FROM node:18-alpine

WORKDIR /usr/src/app

COPY . .
COPY --chown=node:node node_modules ./node_modules

RUN pnpm run build

CMD ["node", "dist/main"]