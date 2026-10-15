FROM node:20-alpine

WORKDIR /app

# Install unzip, ekstrak zip 9router-master, lalu hapus zip
RUN apk add --no-cache unzip && \
    unzip -q 9router-master.zip && \
    cp -r 9router-master/* . && \
    rm -rf 9router-master 9router-master.zip
RUN npm install
RUN npm run build

COPY config.yaml ./config.yaml

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]