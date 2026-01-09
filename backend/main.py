from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
from typing import Optional, List, Dict, Any
import re

app = FastAPI(title="VidGrabber Pro API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://vidgrabbers.vercel.app",
        "https://vidgrabber-pro.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    url: str
    quality: Optional[str] = "1080"
    format: Optional[str] = "mp4"
    previewOnly: Optional[bool] = False

class DownloadResponse(BaseModel):
    success: bool
    downloadUrl: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    thumbnail: Optional[str] = None
    platform: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None
    type: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None

def detect_platform(url: str) -> str:
    """Deteksi platform dari URL"""
    if "tiktok.com" in url or "vm.tiktok" in url:
        return "tiktok"
    elif "instagram.com" in url or "instagr.am" in url:
        return "instagram"
    elif "facebook.com" in url or "fb.watch" in url or "fb.com" in url:
        return "facebook"
    elif "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    else:
        return "unknown"

def sanitize_filename(filename: str) -> str:
    """Sanitize filename untuk keamanan"""
    # Hapus karakter yang tidak aman
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    # Batasi panjang filename
    if len(filename) > 200:
        filename = filename[:200]
    return filename

def get_video_info(url: str, quality: str = "1080", format_type: str = "mp4") -> Dict[str, Any]:
    """Ambil informasi video menggunakan yt-dlp"""
    
    # Konfigurasi yt-dlp
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Ambil metadata
            metadata = {
                'title': info.get('title', 'Unknown'),
                'author': info.get('uploader', info.get('channel', 'Unknown')),
                'videoId': info.get('id', ''),
                'duration': info.get('duration', 0),
                'description': info.get('description', ''),
                'sourceUrl': url,
            }
            
            # Ambil info musik jika ada
            music_info = None
            if info.get('track') or info.get('artist'):
                music_info = {
                    'title': info.get('track', info.get('title', '')),
                    'author': info.get('artist', info.get('creator', ''))
                }
            
            metadata['musicInfo'] = music_info
            
            # Ambil thumbnail terbaik
            thumbnails = info.get('thumbnails', [])
            thumbnail = None
            if thumbnails:
                # Pilih thumbnail dengan resolusi tertinggi
                thumbnail = max(thumbnails, key=lambda x: x.get('width', 0) * x.get('height', 0))
                thumbnail = thumbnail.get('url', '')
            
            # Ambil format download URL
            formats = info.get('formats', [])
            
            # Filter format berdasarkan quality dan type
            if format_type == "mp3":
                # Untuk audio only
                audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                if audio_formats:
                    best_format = max(audio_formats, key=lambda x: x.get('abr', 0))
                    download_url = best_format.get('url', '')
                else:
                    download_url = info.get('url', '')
            else:
                # Untuk video
                quality_map = {
                    "720": 720,
                    "1080": 1080,
                    "4k": 2160
                }
                target_height = quality_map.get(quality, 1080)
                
                # Filter video formats
                video_formats = [f for f in formats if f.get('vcodec') != 'none' and f.get('height')]
                
                if video_formats:
                    # Cari format yang paling dekat dengan quality yang diminta
                    best_format = min(
                        video_formats,
                        key=lambda x: abs(x.get('height', 0) - target_height)
                    )
                    download_url = best_format.get('url', '')
                else:
                    download_url = info.get('url', '')
            
            # Generate filename
            platform = detect_platform(url)
            safe_title = sanitize_filename(metadata['title'])
            filename = f"{platform}_{safe_title}.{format_type}"
            
            return {
                'success': True,
                'downloadUrl': download_url,
                'metadata': metadata,
                'thumbnail': thumbnail,
                'platform': platform,
                'filename': filename,
                'type': 'single'
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "VidGrabber Pro API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/api/download-video": "POST - Download video dari berbagai platform",
            "/api/health": "GET - Health check"
        }
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "VidGrabber Pro API"}

@app.post("/api/download-video", response_model=DownloadResponse)
async def download_video(request: DownloadRequest):
    """
    Endpoint untuk download video dari berbagai platform
    Mendukung: TikTok, Instagram, Facebook, YouTube, dan 1000+ website lainnya
    """
    
    if not request.url:
        raise HTTPException(status_code=400, detail="URL tidak boleh kosong")
    
    platform = detect_platform(request.url)
    
    if platform == "unknown":
        raise HTTPException(
            status_code=400,
            detail="Platform tidak didukung atau URL tidak valid"
        )
    
    try:
        # Preview only mode
        if request.previewOnly:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'skip_download': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.url, download=False)
                
                metadata = {
                    'title': info.get('title', 'Unknown'),
                    'author': info.get('uploader', info.get('channel', 'Unknown')),
                    'videoId': info.get('id', ''),
                    'sourceUrl': request.url,
                }
                
                # Music info
                music_info = None
                if info.get('track') or info.get('artist'):
                    music_info = {
                        'title': info.get('track', info.get('title', '')),
                        'author': info.get('artist', info.get('creator', ''))
                    }
                metadata['musicInfo'] = music_info
                
                # Thumbnail
                thumbnails = info.get('thumbnails', [])
                thumbnail = None
                if thumbnails:
                    thumbnail = max(thumbnails, key=lambda x: x.get('width', 0) * x.get('height', 0))
                    thumbnail = thumbnail.get('url', '')
                
                return DownloadResponse(
                    success=True,
                    metadata=metadata,
                    thumbnail=thumbnail,
                    platform=platform
                )
        
        # Full download mode
        result = get_video_info(request.url, request.quality, request.format)
        
        return DownloadResponse(**result)
        
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if "Video unavailable" in error_msg:
            raise HTTPException(status_code=404, detail="Video tidak tersedia atau sudah dihapus")
        elif "Private video" in error_msg:
            raise HTTPException(status_code=403, detail="Video bersifat private")
        else:
            raise HTTPException(status_code=500, detail=f"Error saat mengunduh: {error_msg}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
