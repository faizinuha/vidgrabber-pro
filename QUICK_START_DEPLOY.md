# 🚀 QUICK START: Deploy Backend ke Railway (5 Menit)

## ✅ Code sudah di-push ke GitHub!

Sekarang ikuti langkah berikut untuk deploy backend:

---

## 📋 Step-by-Step Deploy ke Railway

### **Step 1: Buka Railway**

1. Buka browser dan kunjungi: **https://railway.app**
2. Klik **"Start a New Project"** atau **"Login"**
3. **Sign up/Login dengan GitHub** (klik tombol GitHub)

### **Step 2: Deploy dari GitHub**

1. Setelah login, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Cari dan pilih repository: **`faizinuha/vidgrabber-pro`**
4. Railway akan mendeteksi code Anda

### **Step 3: Konfigurasi Backend**

1. Railway akan menampilkan preview
2. Klik **"Add variables"** (optional, skip untuk sekarang)
3. Klik **"Deploy"**

### **Step 4: Set Root Directory** ⚠️ PENTING!

1. Setelah deploy pertama (mungkin error), klik **Settings**
2. Scroll ke **"Root Directory"**
3. Isi dengan: `backend`
4. Klik **"Save"**
5. Railway akan **auto-redeploy**

### **Step 5: Tunggu Deployment Selesai**

- Lihat tab **"Deployments"**
- Tunggu sampai status menjadi **"Success"** ✅ (2-3 menit)
- Jika ada error, cek **"Logs"**

### **Step 6: Copy Backend URL**

1. Klik tab **"Settings"**
2. Scroll ke **"Domains"**
3. Klik **"Generate Domain"**
4. Copy URL yang muncul, contoh:
   ```
   https://vidgrabber-pro-production.up.railway.app
   ```
5. **SIMPAN URL INI!** ⚠️

---

## 🔧 Update Frontend di Vercel

### **Step 1: Buka Vercel Dashboard**

1. Kunjungi: **https://vercel.com/dashboard**
2. Pilih project: **`vidgrabbers`**

### **Step 2: Tambah Environment Variable**

1. Klik **"Settings"** (tab atas)
2. Klik **"Environment Variables"** (sidebar kiri)
3. Tambahkan variable baru:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app` (dari Step 6 tadi)
   - **Environment**: Pilih semua (Production, Preview, Development)
4. Klik **"Save"**

### **Step 3: Redeploy Vercel**

1. Klik tab **"Deployments"**
2. Klik **titik tiga (...)** di deployment terakhir
3. Klik **"Redeploy"**
4. Tunggu sampai selesai (1-2 menit)

---

## ✅ Testing

### **Test Backend:**

1. Buka: `https://your-railway-url.up.railway.app/docs`
2. Anda akan lihat Swagger UI
3. Test endpoint `/api/health`

### **Test Frontend:**

1. Buka: `https://vidgrabbers.vercel.app`
2. Paste URL video (contoh TikTok/YouTube)
3. Klik **Preview** atau **Download**
4. Jika berhasil → **SELESAI!** 🎉

---

## 🐛 Troubleshooting

### Railway Error: "Build Failed"

**Solusi:**

1. Pastikan Root Directory = `backend`
2. Cek file `requirements.txt` ada di folder `backend/`
3. Lihat logs untuk detail error

### Vercel Error: "CORS Policy"

**Solusi:**

1. Buka file `backend/main.py` di GitHub
2. Edit baris `allow_origins=["*"]` menjadi:
   ```python
   allow_origins=["https://vidgrabbers.vercel.app"]
   ```
3. Commit & push
4. Railway akan auto-redeploy

### Frontend Error: "Failed to fetch"

**Solusi:**

1. Cek apakah `VITE_API_URL` sudah benar di Vercel
2. Pastikan Railway backend masih running
3. Test backend URL di browser

---

## 💰 Biaya

- **Railway**: $5 credit gratis/bulan (cukup untuk traffic ringan-sedang)
- **Vercel**: Gratis unlimited untuk personal projects

---

## 📞 Butuh Bantuan?

Jika ada error, screenshot dan kirim:

1. Railway deployment logs
2. Vercel deployment logs
3. Browser console error (F12)

---

**Selamat Deploy! 🚀**

Setelah selesai, aplikasi Anda akan:

- ✅ Tidak ada error 503 lagi
- ✅ Support 1000+ website
- ✅ Lebih cepat dan stabil
- ✅ 100% gratis
