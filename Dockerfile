# Menggunakan Docker image resmi yang sudah berisi aplikasi 9router siap pakai
FROM ghcr.io/vensvendo/9router:latest

# Menentukan folder kerja utama di cloud
WORKDIR /app

# Menyalin file config.yaml aman milik Anda langsung ke dalam sistem aplikasi
COPY config.yaml ./config.yaml

# Menentukan port default server Northflank
EXPOSE 8080
ENV PORT=8080

# Perintah otomatis untuk langsung menyalakan server 9router
CMD ["npm", "start"]
