FROM node:20-alpine

WORKDIR /app

# Install git, clone langsung dari repository resmi 9router
RUN apk add --no-cache git && \
    git clone https://github.com/decolua/9router.git .
RUN npm install
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

COPY config.yaml ./config.yaml

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]