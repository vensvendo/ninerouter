FROM node:20-alpine

WORKDIR /app

COPY . .
RUN npm install

COPY config.yaml ./config.yaml

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]
