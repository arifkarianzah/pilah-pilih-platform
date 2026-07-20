# Contributing Guide — pilah-pilih-platform

Panduan singkat untuk tim agar alur kerja tetap rapi dan konsisten.

---

## Branch Naming

Gunakan format berikut saat membuat branch baru:

| Tipe | Format | Contoh |
|------|--------|--------|
| Fitur baru | `feat/nama-fitur` | `feat/login-pengepul` |
| Perbaikan bug | `fix/nama-bug` | `fix/token-expired-crash` |
| Refactor / cleanup | `refactor/nama` | `refactor/auth-middleware` |
| Dokumentasi | `docs/nama` | `docs/update-readme` |

> **Aturan umum:** Gunakan huruf kecil dan tanda `-` sebagai pemisah kata.

---

## Alur Kerja Pull Request

### `main` adalah branch protected

- **Tidak boleh push langsung ke `main`.**
- Semua perubahan harus masuk lewat **Pull Request (PR)**.
- Setiap PR **wajib di-review minimal 1 orang** sebelum bisa di-merge.

### Langkah standar

```bash
# 1. Buat branch dari main yang terbaru
git checkout main
git pull origin main
git checkout -b feat/nama-fitur

# 2. Kerjakan perubahan, commit sesering mungkin
git add .
git commit -m "feat: deskripsi singkat perubahan"

# 3. Push dan buka PR ke main
git push origin feat/nama-fitur
```

Buka PR di GitHub dan minta salah satu anggota tim untuk review.

---

## Branch Harus Short-Lived

Selesaikan dan merge branch **dalam 1–3 hari kerja**. Branch yang hidup
terlalu lama berisiko konflik besar saat merge. Jika sebuah fitur besar,
pecah menjadi beberapa PR kecil yang bisa di-review secara bertahap.

---

## Setup Lokal

### 1. Clone repo dan install semua dependencies

```bash
git clone https://github.com/arifkarianzah/pilah-pilih-platform.git
cd pilah-pilih-platform
npm install
```

> Karena menggunakan npm workspaces + Turborepo, satu kali `npm install`
> di root akan menginstall dependencies untuk semua package sekaligus.

### 2. Siapkan environment variables

Salin file `.env.example` ke `.env` di masing-masing folder, lalu isi
valuenya sesuai environment lokal kamu:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (lakukan untuk setiap app yang kamu kerjakan)
cp apps/web-user/.env.example apps/web-user/.env
cp apps/web-petugas/.env.example apps/web-petugas/.env
cp apps/web-pengepul/.env.example apps/web-pengepul/.env
cp apps/web-admin/.env.example apps/web-admin/.env
```

> ⚠️ **Jangan pernah commit file `.env`** — sudah masuk `.gitignore`.

### 3. Jalankan dev server

```bash
# Jalankan semua sekaligus (menggunakan Turborepo)
npm run dev

# Atau jalankan per package
cd backend && npm run dev
cd apps/web-user && npm run dev
```

---

## Pesan Commit

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <deskripsi singkat>
```

| Type | Kapan digunakan |
|------|-----------------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `chore` | Maintenance, update deps |
| `refactor` | Perubahan kode tanpa tambah fitur/fix bug |
| `docs` | Perubahan dokumentasi saja |

**Contoh:**
```
feat: tambah halaman profil pengepul
fix: perbaiki crash saat token JWT expired
chore: update dependency socket.io ke v4.8
```
