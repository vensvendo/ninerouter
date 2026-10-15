# Menggunakan base image Node.js resmi yang stabil
FROM node:20-alpine

# Membuat folder kerja di dalam server
WORKDIR /app

# Mengunduh otomatis source code asli 9router dari repository pusat ke server
RUN apk add --no-fetching --no-cache git && \
    git clone https://github.com/vensvendo/9router.git . && \
    npm install

# Menyalin file config.yaml aman milik Anda ke dalam aplikasi
COPY config.yaml ./config.yaml

# Menentukan port default server
EXPOSE 8080
ENV PORT=8080

# Perintah untuk menyalakan 9router
CMD ["npm", "start"]
