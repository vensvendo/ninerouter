FROM node:20-alpine

WORKDIR /app

COPY . .
RUN cp -r 9router-master/* . && rm -rf 9router-master
RUN npm install
RUN npm run build

COPY config.yaml ./config.yaml

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]