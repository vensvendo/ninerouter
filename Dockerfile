FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git && git clone https://github.com . && npm install --omit=dev
COPY config.yaml ./config.yaml
EXPOSE 8080
ENV PORT=8080
CMD ['npm', 'start']
