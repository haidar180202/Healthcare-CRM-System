# build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && npm cache clean --force && rm -rf node_modules package-lock.json && npm install --legacy-peer-deps --fetch-retries=5 --fetch-retry-maxtimeout=60000
COPY . .
RUN npm run build --verbose

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]