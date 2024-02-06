FROM node:current as base

WORKDIR /home/node/app

COPY package*.json ./
COPY src ./
COPY prisma ./
COPY build ./

RUN npm i

COPY . .

RUN npx prisma generate

FROM base as production

ENV NODE_PATH=./build

COPY src ./
COPY prisma/migrations ./prisma

RUN npm run build

