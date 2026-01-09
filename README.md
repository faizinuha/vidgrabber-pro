# 🎬 VidGrabber Pro — Download Video Tanpa Batas

Capek download video ribet, penuh iklan, dan harus login? 😤  
Tenang… sekarang ada solusinya 😎👇

## ✨ Fitur Utama

VidGrabber Pro adalah layanan downloader video cepat & sederhana dengan backend **yt-dlp** yang powerful!

### 📥 Platform yang Didukung:

- ✅ TikTok
- ✅ Instagram (Reels, Posts, Stories)
- ✅ Facebook (Videos, Watch)
- ✅ YouTube (Videos, Shorts)
- ✅ Twitter/X
- ✅ Reddit
- ✅ Dan **1000+ website lainnya**!

### 💯 Keunggulan:

- 🆓 **Gratis selamanya**
- 🚫 **Tanpa iklan**
- 🔐 **Tanpa registrasi**
- ⚡ **Cepat & mudah** (paste link → pilih format → download)
- 🎯 **Stabil & Reliable** (menggunakan yt-dlp, bukan API pihak ketiga)
- 🔒 **Privacy-focused** (tidak menyimpan data video Anda)

### 🎞️ Format Download:

- Video 720p / 1080p
- Audio Only (MP3)
- 4K\* (Premium)

\*Resolusi 4K tersedia via donasi sukarela 🙏

## 📌 Cara Pakai:

1️⃣ Copy link video  
2️⃣ Paste ke VidGrabber Pro  
3️⃣ Pilih format & download

## 🚀 Instalasi & Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm atau bun

### 1. Clone Repository

```bash
git clone https://github.com/faizinuha/vidgrabber-pro.git
cd vidgrabber-pro
```

### 2. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend akan berjalan di `http://localhost:8000`

### 3. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env dan sesuaikan VITE_API_URL jika perlu

# Run development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Build untuk Production

```bash
# Build frontend
npm run build

# Build Android (optional)
npx cap sync
```

## 🏗️ Arsitektur

```
┌─────────────────┐
│   Frontend      │
│  (React + Vite) │
│   Port: 5173    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │
│ (FastAPI)       │
│   Port: 8000    │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│    yt-dlp       │
│ (Video Extractor)│
└─────────────────┘
```

## 🌐 Demo

🔗 **Live Demo**: https://vidgrabbers.vercel.app

## 🛠️ Tech Stack

### Frontend:

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Query

### Backend:

- FastAPI
- yt-dlp
- Python 3.11
- Uvicorn

## 📝 API Documentation

Setelah backend berjalan, akses dokumentasi API di:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - Free to use and modify

## 💖 Support

Jika aplikasi ini bermanfaat, consider untuk:

- ⭐ Star repository ini
- 🐛 Report bugs
- 💡 Suggest new features
- ☕ [Buy me a coffee](https://trakteer.id/MyCici/gift)

---

**Powered by yt-dlp** 🚀  
Made with ❤️ by [@faizinuha](https://github.com/faizinuha)
