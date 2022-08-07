FROM node:16.15.1-alpine3.16
WORKDIR /usr/app

COPY tsconfig.json ./
COPY package-lock.json ./
COPY package.json ./
COPY src ./src

RUN npm install
RUN npm run generate
RUN npm run build

EXPOSE 9000

CMD ["node", "./build/index.js"]
