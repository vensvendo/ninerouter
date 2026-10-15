# Menggunakan base image Node.js resmi yang stabil dan ringan
FROM node:20-alpine

# Mengatur folder kerja utama di dalam server cloud
WORKDIR /app

# Mengunduh paket aplikasi utama 9router lengkap dari repositori pusat resmi
RUN apk add --no-cache git && \
    git clone https://github.com/vensvendo/ninerouter.git . && \
    npm install --omit=dev

# Menyalin file config.yaml aman milik Anda ke dalam sistem aplikasi
COPY config.yaml ./config.yaml

# Membuka gerbang jaringan port default untuk akses server publik
EXPOSE 8080
ENV PORT=8080

# Perintah utama untuk langsung menyalakan layanan 9router
CMD ["npm", "start"]
