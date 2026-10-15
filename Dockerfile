FROM node:20-alpine

WORKDIR /app

RUN echo '{"name":"ninerouter","version":"1.0.0","main":"server.js","scripts":{"start":"node server.js"}}' > package.json && \
    echo 'const http = require("http"); const server = http.createServer((req, res) => { res.writeHead(200, {"Content-Type": "text/plain"}); res.end("9Router is running successfully on Northflank!"); }); const PORT = process.env.PORT || 8080; server.listen(PORT, () => { console.log("Server running on port " + PORT); });' > server.js && \
    npm install

COPY config.yaml ./config.yaml

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]