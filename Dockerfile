FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create dirs for SQLite and uploads
RUN mkdir -p /data/db /data/uploads

EXPOSE 3000

CMD ["node", "server.js"]
