# Use official Node LTS image
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN chown -R node:node /app
USER node
ENTRYPOINT [ "node", "src/cli/index.js" ]