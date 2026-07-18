# Pilah Pilih Platform

Monorepo untuk platform manajemen sampah Pilah Pilih. Menggabungkan backend API dan empat aplikasi frontend dalam satu repositori terpusat.

## 📂 Struktur Proyek

- `backend/` — Server API (Express + Socket.io)
- `apps/web-user/` — Frontend Aplikasi User (Masyarakat)
- `apps/web-petugas/` — Frontend Aplikasi Petugas (Kolektor)
- `apps/web-pengepul/` — Frontend Aplikasi Pengepul (Mitra)
- `apps/web-admin/` — Frontend Admin Panel

## ⚙️ Persyaratan Sistem

- **Node.js** `>=20`
- **npm** (dengan dukungan *workspaces*)

## 🔧 Cara Setup (Environment)

Di setiap folder service, copy file `.env.example` menjadi `.env` lalu isi nilainya sesuai environment lokal Anda.

```bash
# Contoh setup backend
cd backend
cp .env.example .env
# Edit nilai DB_HOST, DB_USER, dll
```

## 🚀 Cara Menjalankan (Development)

Proyek ini menggunakan Turborepo untuk menjalankan semua service secara paralel. Dari root monorepo, jalankan:

1. Instalasi dependensi:
   ```bash
   npm install
   ```
2. Jalankan semua server:
   ```bash
   npx turbo run dev
   ```
