FROM node:20

WORKDIR /usr/src/app

COPY ./ ./
RUN npm cache clean --force && npm install --legacy-peer-deps --fetch-retries=5 --fetch-retry-maxtimeout=60000
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

CMD ["node", "dist/main"]