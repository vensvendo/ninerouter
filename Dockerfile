FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git && git clone https://github.com/vensvendo/9router.git . && npm install --omit=dev
COPY config.yaml ./config.yaml
EXPOSE 8080
ENV PORT=8080
CMD ['npm', 'start']
