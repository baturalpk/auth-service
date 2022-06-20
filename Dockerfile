# Build stage
FROM node:16.15.1-alpine3.16 AS building
WORKDIR /usr/app

COPY tsconfig.json ./
COPY package.json ./
COPY src ./src

RUN npm i && npm run build

# Execution stage
FROM node:16.15.1-alpine3.16
WORKDIR /usr/server

COPY package.json ./
COPY --from=building /usr/app/build .

RUN npm i --only=production

EXPOSE 9000

CMD ["node", "index.js"]
