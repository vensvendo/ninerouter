# Menggunakan base image Node.js resmi yang stabil
FROM node:20-alpine

# Membuat folder kerja di dalam server
WORKDIR /app

# Mengunduh otomatis aplikasi utama 9router langsung ke server cloud
RUN apk add --no-cache git && \
    git clone https://github.com . && \
    npm install --omit=dev || npm install --production

# Menyalin file config.yaml aman milik Anda ke dalam sistem
COPY config.yaml ./config.yaml

# Menentukan port default server Northflank
EXPOSE 8080
ENV PORT=8080

# Perintah untuk menyalakan server 9router
CMD ["npm", "start"]
