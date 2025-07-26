ARG NODE_VERSION=24.4.0

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci && npm install 

COPY . .

EXPOSE 4002

CMD ["npm", "run", "dev"]
