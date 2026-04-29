FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production && npm install nodemon --save-dev
COPY . .
EXPOSE 3000
CMD ["node_modules/.bin/nodemon", "--watch", ".", "--ext", "js,json", "server.js"]
