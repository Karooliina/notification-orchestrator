ARG NODE_VERSION=24.4.0

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# Development stage
FROM base as development

COPY . .

EXPOSE 4002

CMD ["npm", "run", "dev"]

# Production stage
FROM base as production

COPY . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

EXPOSE 4002

CMD ["npm", "start"]
