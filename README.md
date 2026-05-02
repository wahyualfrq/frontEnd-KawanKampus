# KawanKampus Frontend

KawanKampus adalah aplikasi platform mahasiswa modern yang dirancang untuk membantu produktivitas kampus. Aplikasi ini mengintegrasikan manajemen tugas (Kanban), asisten cerdas (AI Chatbot), dan penemuan fasilitas kampus (Places) dalam satu antarmuka yang elegan dan responsif.

## 🚀 Tech Stack

- **Framework**: [React.js](https://reactjs.org/) dengan [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (dengan Middleware Persist)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## ✨ Fitur Utama

### 1. Authentication
- Login & Register dengan UI modern.
- Persistensi sesi menggunakan JWT yang disimpan di LocalStorage.
- Proteksi Route (Public & Private routes).
- Interceptor otomatis untuk Authorization Header.

### 2. Kanban Board (Core Feature)
- Manajemen tugas dengan 3 status: **TODO**, **IN_PROGRESS**, **DONE**.
- Fungsionalitas Drag & Drop yang mulus antar kolom.
- Integrasi penuh dengan backend (CRUD Tasks).
- Pembaruan status tugas secara *real-time*.

### 3. AI Chatbot
- Antarmuka chat interaktif ala ChatGPT/WhatsApp.
- Integrasi asisten cerdas untuk menjawab pertanyaan mahasiswa.
- Indikator "Typing" dan auto-scroll untuk pengalaman pengguna yang lebih baik.

### 4. Nearby Places
- Pencarian fasilitas kampus berdasarkan koordinat (Latitude & Longitude).
- Integrasi dengan Geolocation API browser untuk mendapatkan lokasi terkini.
- Tampilan list tempat dengan informasi jarak dan kategori.

## 📁 Struktur Proyek (Clean Architecture)

```text
src/
├── app/          # Konfigurasi utama aplikasi
├── components/   # Komponen UI global & layout
├── constants/    # Variabel konstanta & config
├── features/     # Logika spesifik per fitur (e.g., Kanban)
├── hooks/        # Custom React hooks
├── pages/        # Komponen halaman (Routes)
├── routes/       # Definisi rute & navigasi
├── services/     # API layer (Axios instance)
├── store/        # State management (Zustand)
└── utils/        # Fungsi helper & utilities
```

## 🛠️ Instalasi & Persiapan

1. **Clone repositori:**
   ```bash
   git clone https://github.com/wahyualfrq/frontEnd-KawanKampus.git
   cd frontEnd-KawanKampus
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Pastikan backend berjalan di `http://localhost:3000/api/v1` (atau sesuaikan di `src/services/api.js`).

4. **Jalankan aplikasi (Development):**
   ```bash
   npm run dev
   ```

5. **Build untuk Production:**
   ```bash
   npm run build
   ```

## 📡 API Reference

- **Auth**: `/auth/register`, `/auth/login`
- **Tasks**: `/tasks` (GET, POST), `/tasks/:id` (PATCH, DELETE)
- **Chatbot**: `/chatbot` (POST)
- **Places**: `/places/nearby` (GET)

---

Dibuat dengan ❤️ untuk mahasiswa Indonesia.
