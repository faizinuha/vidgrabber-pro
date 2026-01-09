# 🚀 Panduan Deployment VidGrabber Pro

## Arsitektur Deployment

```
Frontend (Vercel)  ──────►  Backend (Railway/Render)
https://vidgrabbers.vercel.app    https://your-api.railway.app
```

---

## 📦 Opsi 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

### A. Deploy Backend ke Railway

1. **Buat akun di Railway.app** (gratis)

   - Kunjungi: https://railway.app
   - Sign up dengan GitHub

2. **Deploy Backend:**

   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli

   # Login
   railway login

   # Deploy dari folder backend
   cd backend
   railway init
   railway up
   ```

   **ATAU via GitHub:**

   - Push code ke GitHub
   - Di Railway Dashboard → New Project → Deploy from GitHub
   - Pilih repository `vidgrabber-pro`
   - Set Root Directory: `backend`
   - Railway akan auto-detect Python dan deploy

3. **Set Environment Variables di Railway:**

   - Tidak ada yang perlu diset untuk basic setup
   - Railway akan auto-assign PORT

4. **Copy Backend URL:**
   - Setelah deploy, Railway akan memberikan URL seperti:
   - `https://vidgrabber-backend-production.up.railway.app`
   - **SIMPAN URL INI!**

### B. Deploy Frontend ke Vercel

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   # Dari root directory
   vercel
   ```

4. **Set Environment Variable:**

   - Di Vercel Dashboard → Project Settings → Environment Variables
   - Tambahkan:
     ```
     VITE_API_URL = https://your-backend-url.railway.app
     ```
   - Ganti dengan URL Railway dari step A.4

5. **Redeploy:**

   ```bash
   vercel --prod
   ```

6. **Selesai!** 🎉
   - Frontend: `https://vidgrabbers.vercel.app`
   - Backend: `https://your-backend.railway.app`

---

## 📦 Opsi 2: Deploy Semuanya di Render

### A. Deploy Backend

1. **Buat akun di Render.com** (gratis)

   - Kunjungi: https://render.com
   - Sign up dengan GitHub

2. **Create New Web Service:**

   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Settings:
     ```
     Name: vidgrabber-backend
     Root Directory: backend
     Environment: Python 3
     Build Command: pip install -r requirements.txt
     Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

3. **Deploy & Copy URL**

### B. Deploy Frontend

1. **Create New Static Site:**

   - Dashboard → New → Static Site
   - Connect same GitHub repository
   - Settings:
     ```
     Name: vidgrabber-frontend
     Root Directory: (leave empty)
     Build Command: npm install && npm run build
     Publish Directory: dist
     ```

2. **Add Environment Variable:**

   ```
   VITE_API_URL = https://vidgrabber-backend.onrender.com
   ```

3. **Deploy!**

---

## 📦 Opsi 3: Deploy di Fly.io (Advanced)

### Backend

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd backend
flyctl launch
flyctl deploy
```

### Frontend

Deploy ke Vercel seperti Opsi 1.B

---

## 🔧 Update .env untuk Production

Setelah backend di-deploy, update file `.env` di local:

```env
# Development
VITE_API_URL=http://localhost:8000

# Production (uncomment saat build)
# VITE_API_URL=https://your-backend-url.railway.app
```

---

## ✅ Checklist Deployment

### Backend (Railway/Render):

- [ ] Backend berhasil di-deploy
- [ ] API endpoint `/api/health` bisa diakses
- [ ] API docs tersedia di `/docs`
- [ ] Copy URL backend

### Frontend (Vercel):

- [ ] Environment variable `VITE_API_URL` sudah diset
- [ ] Build berhasil
- [ ] Website bisa diakses
- [ ] Test download video dari berbagai platform

---

## 🐛 Troubleshooting

### Error: CORS Policy

**Solusi:** Update `main.py` di backend:

```python
allow_origins=["https://vidgrabbers.vercel.app"]
```

### Error: 503 Service Unavailable

**Solusi:**

- Cek apakah backend masih running
- Verifikasi URL backend di environment variable

### Error: Module not found

**Solusi:**

- Pastikan `requirements.txt` lengkap
- Redeploy backend

---

## 💰 Biaya

### Railway (Backend):

- **Free Tier**: $5 credit/bulan (cukup untuk traffic ringan-sedang)
- **Hobby**: $5/bulan (unlimited)

### Vercel (Frontend):

- **Free Tier**: Unlimited untuk personal projects
- Bandwidth: 100GB/bulan

### Render (Alternative):

- **Free Tier**: 750 jam/bulan (cukup untuk 1 service)
- Auto-sleep setelah 15 menit tidak aktif

---

## 📊 Monitoring

### Railway:

- Dashboard → Metrics
- Lihat CPU, Memory, Network usage

### Vercel:

- Analytics → Usage
- Monitor bandwidth dan requests

---

## 🔄 Update Aplikasi

### Update Backend:

```bash
cd backend
git add .
git commit -m "Update backend"
git push
# Railway/Render akan auto-deploy
```

### Update Frontend:

```bash
git add .
git commit -m "Update frontend"
git push
vercel --prod
```

---

## 📞 Support

Jika ada masalah deployment:

1. Cek logs di Railway/Render/Vercel dashboard
2. Test API endpoint dengan Postman
3. Verifikasi environment variables

---

**Happy Deploying! 🚀**
