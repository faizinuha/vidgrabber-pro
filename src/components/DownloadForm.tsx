import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Download, Link2, Music, Video, Sparkles, ExternalLink, CheckCircle, XCircle, Loader2, Image, Eye, AlertCircle, User, FileText, Globe, Copyright, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Platform = "tiktok" | "instagram" | "facebook" | "youtube" | null;
type Format = "video" | "audio";
type Resolution = "720p" | "1080p" | "4k";
type DownloadStatus = "idle" | "previewing" | "fetching" | "downloading" | "complete" | "error";

const DONATION_COOKIE_KEY = "videograb_4k_access";
const ACCESS_TOKEN_KEY = "videograb_access_token";
const TRAKTEER_URL = "https://trakteer.id/MyCici/gift";

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  instagram: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  facebook: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
};

const detectPlatform = (url: string): Platform => {
  if (url.includes("tiktok.com") || url.includes("vm.tiktok")) return "tiktok";
  if (url.includes("instagram.com") || url.includes("instagr.am")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) return "facebook";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return null;
};

// Cookie utilities
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export function DownloadForm() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>(null);
  const [format, setFormat] = useState<Format>("video");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [has4KAccess, setHas4KAccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Image download states
  const [imageUrl, setImageUrl] = useState("");
  const [imageDownloading, setImageDownloading] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has 4K access from cookie
    const access = getCookie(DONATION_COOKIE_KEY);
    
    if (access === "true") {
      setHas4KAccess(true);
    }
  }, []);

  const verifyAccess = async () => {
    const input = transactionId.trim();
    if (!input) {
      toast({
        title: "Input Kosong",
        description: "Masukkan Token atau Transaction ID",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Check if input looks like a UUID (token) or transaction ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
      
      const { data, error } = await supabase.functions.invoke('verify-token', {
        body: isUUID ? { token: input } : { transaction_id: input }
      });

      if (data?.valid) {
        setCookie(DONATION_COOKIE_KEY, "true", 365);
        setCookie(ACCESS_TOKEN_KEY, data.token || input, 365);
        setHas4KAccess(true);
        toast({
          title: "Verifikasi Berhasil!",
          description: data.supporter_name 
            ? `Terima kasih ${data.supporter_name}! Akses 4K aktif.`
            : "Akses 4K berhasil diaktifkan.",
        });
      } else {
        toast({
          title: "Verifikasi Gagal",
          description: data?.message || "Token/Transaction ID tidak valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying:", error);
      toast({
        title: "Error",
        description: "Gagal memverifikasi. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPlatform(detectPlatform(value));
    // Reset status when URL changes
    setDownloadStatus("idle");
    setDownloadProgress(0);
  };

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pickerOptions, setPickerOptions] = useState<Array<{ id: number; url: string; thumbnail?: string; type: string }>>([]);
  const [videoMetadata, setVideoMetadata] = useState<{ 
    title?: string; 
    author?: string; 
    platform?: string;
    filename?: string;
    thumbnail?: string;
    videoId?: string;
    musicInfo?: { title?: string; author?: string } | null;
    sourceUrl?: string;
  } | null>(null);

  const handlePreview = async () => {
    if (!url) {
      toast({
        title: "URL Kosong",
        description: "Masukkan URL video yang ingin diunduh",
        variant: "destructive",
      });
      return;
    }

    if (!platform) {
      toast({
        title: "Platform Tidak Dikenali",
        description: "Pastikan URL dari TikTok, Instagram, Facebook, atau YouTube",
        variant: "destructive",
      });
      return;
    }

    setDownloadStatus("previewing");
    setVideoMetadata(null);

    try {
      const { data, error } = await supabase.functions.invoke('download-video', {
        body: { url, previewOnly: true }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Gagal mendapatkan preview");
      }

      setVideoMetadata({
        title: data.metadata?.title,
        author: data.metadata?.author,
        platform: data.platform,
        thumbnail: data.thumbnail,
        videoId: data.metadata?.videoId,
        musicInfo: data.metadata?.musicInfo || null,
        sourceUrl: data.metadata?.sourceUrl,
      });

      setDownloadStatus("idle");
      toast({
        title: "Preview Berhasil",
        description: "Klik Download untuk mengunduh video",
      });

    } catch (error: any) {
      console.error("Preview error:", error);
      setDownloadStatus("error");
      toast({
        title: "Gagal Preview",
        description: error.message || "Terjadi kesalahan saat mengambil preview",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!url) {
      toast({
        title: "URL Kosong",
        description: "Masukkan URL video yang ingin diunduh",
        variant: "destructive",
      });
      return;
    }

    if (!platform) {
      toast({
        title: "Platform Tidak Dikenali",
        description: "Pastikan URL dari TikTok, Instagram, Facebook, atau YouTube",
        variant: "destructive",
      });
      return;
    }

    if (resolution === "4k" && !has4KAccess) {
      toast({
        title: "Resolusi 4K",
        description: "Silakan donate terlebih dahulu untuk mengakses resolusi 4K!",
        variant: "default",
      });
      return;
    }

    setDownloadStatus("fetching");
    setDownloadProgress(10);
    setDownloadUrl(null);
    setPickerOptions([]);
    setVideoMetadata(null);

    try {
      const quality = resolution === "4k" ? "4k" : resolution === "1080p" ? "1080" : "720";
      
      const { data, error } = await supabase.functions.invoke('download-video', {
        body: { 
          url, 
          quality,
          format: format === "audio" ? "mp3" : "mp4"
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Gagal memproses video");
      }

      setDownloadProgress(50);
      setDownloadStatus("downloading");

      if (data.type === "picker" && data.options) {
        setPickerOptions(data.options);
        setVideoMetadata({
          platform: data.platform,
          thumbnail: data.thumbnail,
          ...data.metadata,
        });
        setDownloadProgress(100);
        setDownloadStatus("complete");
        toast({
          title: "Video Ditemukan!",
          description: `${data.options.length} file tersedia untuk diunduh`,
        });
      } else if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setVideoMetadata({
          title: data.metadata?.title || data.filename,
          author: data.metadata?.author,
          platform: data.platform,
          filename: data.filename,
          thumbnail: data.thumbnail,
          videoId: data.metadata?.videoId,
          musicInfo: data.metadata?.musicInfo || null,
          sourceUrl: data.metadata?.sourceUrl,
        });
        setDownloadProgress(100);
        setDownloadStatus("complete");
        toast({
          title: "Video Siap!",
          description: data.metadata?.title || "Klik tombol Simpan File untuk mengunduh",
        });
      }

    } catch (error: any) {
      console.error("Download error:", error);
      setDownloadStatus("error");
      toast({
        title: "Gagal Mengunduh",
        description: error.message || "Terjadi kesalahan saat memproses video",
        variant: "destructive",
      });
    }
  };

  const triggerDownload = (downloadLink: string) => {
    const a = document.createElement('a');
    a.href = downloadLink;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  const resetDownload = () => {
    setDownloadStatus("idle");
    setDownloadProgress(0);
    setUrl("");
    setPlatform(null);
    setDownloadUrl(null);
    setPickerOptions([]);
    setVideoMetadata(null);
  };

  const getStatusMessage = () => {
    switch (downloadStatus) {
      case "previewing":
        return "Mengambil preview video...";
      case "fetching":
        return "Mengambil informasi video...";
      case "downloading":
        return `Memproses ${format === "video" ? "video" : "audio"} (${resolution})...`;
      case "complete":
        return pickerOptions.length > 0 ? `${pickerOptions.length} file tersedia` : "Video siap diunduh!";
      case "error":
        return "Gagal mengunduh. Silakan coba lagi.";
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* URL Input */}
      <div className="glass-card p-6 space-y-4">
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste URL video di sini..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={downloadStatus !== "idle"}
            className="pl-12 h-14 text-base bg-secondary/50 border-border focus:border-primary"
          />
          {platform && (
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium border ${platformColors[platform]}`}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </span>
          )}
        </div>

        {/* Format Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Format</label>
            <div className="flex gap-2">
              <Button
                variant={format === "video" ? "default" : "outline"}
                onClick={() => setFormat("video")}
                disabled={downloadStatus !== "idle"}
                className="flex-1"
              >
                <Video className="w-4 h-4" />
                Video
              </Button>
              <Button
                variant={format === "audio" ? "default" : "outline"}
                onClick={() => setFormat("audio")}
                disabled={downloadStatus !== "idle"}
                className="flex-1"
              >
                <Music className="w-4 h-4" />
                Audio
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Resolusi</label>
            <div className="flex gap-2">
              {(["720p", "1080p", "4k"] as Resolution[]).map((res) => (
                <Button
                  key={res}
                  variant={resolution === res ? "default" : "outline"}
                  onClick={() => setResolution(res)}
                  disabled={downloadStatus !== "idle"}
                  className={`flex-1 ${res === "4k" ? "relative" : ""}`}
                >
                  {res.toUpperCase()}
                  {res === "4k" && !has4KAccess && (
                    <Sparkles className="w-3 h-3 text-warning absolute -top-1 -right-1" />
                  )}
                  {res === "4k" && has4KAccess && (
                    <span className="w-2 h-2 bg-green-500 rounded-full absolute -top-1 -right-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 4K Notice - QR Code Section */}
        {resolution === "4k" && !has4KAccess && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm text-warning">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* QR Code */}
              <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(TRAKTEER_URL)}`}
                  alt="Scan QR Code untuk Donate"
                  className="w-28 h-28"
                />
              </div>
              
              {/* Instructions */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="font-semibold flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="w-4 h-4" />
                  Akses Resolusi 4K
                </div>
                <p className="text-xs opacity-80">
                  1. Scan QR Code atau klik tombol donate<br/>
                  2. Selesaikan pembayaran di Trakteer<br/>
                  3. Masukkan Transaction ID untuk verifikasi
                </p>
                <a
                  href={TRAKTEER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning text-warning-foreground rounded-lg text-xs font-medium hover:bg-warning/90 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka Trakteer
                </a>
              </div>
            </div>
            
            {/* Transaction ID verification */}
            <div className="mt-3 pt-3 border-t border-warning/20">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Masukkan Transaction ID dari Trakteer..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="flex-1 h-9 text-sm bg-background/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={verifyAccess}
                  disabled={isVerifying || !transactionId}
                  className="border-warning/50"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {resolution === "4k" && has4KAccess && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Akses 4K aktif! Terima kasih atas dukungan Anda.
          </div>
        )}

        {/* Video Preview Thumbnail */}
        {videoMetadata?.thumbnail && downloadStatus === "idle" && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4 text-primary" />
              Preview Video
            </div>
            <div className="relative rounded-lg overflow-hidden bg-black/20">
              <img
                src={videoMetadata.thumbnail}
                alt="Video thumbnail"
                className="w-full max-h-64 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {/* Video Info */}
            <div className="space-y-2">
              {videoMetadata.title && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">Judul</span>
                    <p className="text-sm font-medium truncate">{videoMetadata.title}</p>
                  </div>
                </div>
              )}
              {videoMetadata.author && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">Author</span>
                    <p className="text-sm font-medium">{videoMetadata.author}</p>
                  </div>
                </div>
              )}
              {videoMetadata.videoId && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">Video ID</span>
                    <p className="text-sm font-mono text-muted-foreground">{videoMetadata.videoId}</p>
                  </div>
                </div>
              )}
              {videoMetadata.platform && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${platformColors[videoMetadata.platform] || 'bg-secondary'}`}>
                  {videoMetadata.platform.charAt(0).toUpperCase() + videoMetadata.platform.slice(1)}
                </span>
              )}
            </div>
            
            {/* Music Copyright Info Section */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Info Musik & Copyright</span>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 space-y-2">
                {videoMetadata.musicInfo ? (
                  <div className="space-y-1">
                    {videoMetadata.musicInfo.title && (
                      <div className="flex items-start gap-2">
                        <Music className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs text-muted-foreground">Judul Lagu</span>
                          <p className="text-sm font-medium text-warning">{videoMetadata.musicInfo.title}</p>
                        </div>
                      </div>
                    )}
                    {videoMetadata.musicInfo.author && (
                      <div className="flex items-start gap-2">
                        <Copyright className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs text-muted-foreground">Artis / Pembuat Musik</span>
                          <p className="text-sm font-medium text-warning">{videoMetadata.musicInfo.author}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Info musik tidak tersedia. Audio mungkin original atau memiliki hak cipta.
                    </p>
                  </div>
                )}
                
                {/* Credit Section */}
                <div className="pt-2 border-t border-warning/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Credit Video:</strong> Konten dari{' '}
                    <span className="font-medium text-primary">
                      {videoMetadata.platform?.charAt(0).toUpperCase()}{videoMetadata.platform?.slice(1)}
                    </span>
                    {videoMetadata.author && (
                      <> oleh <span className="font-medium">{videoMetadata.author}</span></>
                    )}
                    {videoMetadata.musicInfo?.author && (
                      <>
                        <br/>
                        <strong className="text-foreground">Credit Musik:</strong>{' '}
                        <span className="font-medium text-warning">{videoMetadata.musicInfo.author}</span>
                        {videoMetadata.musicInfo.title && <> - "{videoMetadata.musicInfo.title}"</>}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Loading */}
        {downloadStatus === "previewing" && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              {getStatusMessage()}
            </div>
          </div>
        )}

        {/* Download Progress */}
        {(downloadStatus === "fetching" || downloadStatus === "downloading" || downloadStatus === "complete" || downloadStatus === "error") && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                {downloadStatus === "fetching" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {downloadStatus === "downloading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {downloadStatus === "complete" && <CheckCircle className="w-4 h-4 text-green-500" />}
                {downloadStatus === "error" && <XCircle className="w-4 h-4 text-destructive" />}
                {getStatusMessage()}
              </span>
              <span className="text-sm text-muted-foreground">
                {downloadStatus === "downloading" && `${Math.round(downloadProgress)}%`}
              </span>
            </div>
            
            <Progress 
              value={downloadStatus === "fetching" ? 10 : downloadProgress} 
              className="h-2"
            />

            {downloadStatus === "complete" && (
              <div className="space-y-3 pt-2">
                {/* Video Metadata with Thumbnail */}
                {videoMetadata && (
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
                    {videoMetadata.thumbnail && (
                      <div className="relative rounded-lg overflow-hidden bg-black/20">
                        <img
                          src={videoMetadata.thumbnail}
                          alt="Video thumbnail"
                          className="w-full max-h-48 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {videoMetadata.title && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs text-muted-foreground">Judul</span>
                          <p className="text-sm font-medium truncate">{videoMetadata.title}</p>
                        </div>
                      </div>
                    )}
                    {videoMetadata.author && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs text-muted-foreground">Author</span>
                          <p className="text-sm font-medium">{videoMetadata.author}</p>
                        </div>
                      </div>
                    )}
                    {videoMetadata.videoId && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs text-muted-foreground">Video ID</span>
                          <p className="text-sm font-mono text-xs text-muted-foreground">{videoMetadata.videoId}</p>
                        </div>
                      </div>
                    )}
                    {videoMetadata.platform && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${platformColors[videoMetadata.platform] || 'bg-secondary'}`}>
                          {videoMetadata.platform.charAt(0).toUpperCase() + videoMetadata.platform.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format === "video" ? "Video" : "Audio"} • {resolution.toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Music Copyright Info in Complete Section */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="w-4 h-4 text-warning" />
                        <span className="text-xs font-medium">Info Musik & Copyright</span>
                      </div>
                      <div className="p-2 rounded-lg bg-warning/5 border border-warning/20 space-y-1.5">
                        {videoMetadata.musicInfo ? (
                          <div className="space-y-1">
                            {videoMetadata.musicInfo.title && (
                              <div className="flex items-start gap-2">
                                <Music className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-xs text-muted-foreground">Judul Lagu</span>
                                  <p className="text-xs font-medium text-warning">{videoMetadata.musicInfo.title}</p>
                                </div>
                              </div>
                            )}
                            {videoMetadata.musicInfo.author && (
                              <div className="flex items-start gap-2">
                                <Copyright className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-xs text-muted-foreground">Artis</span>
                                  <p className="text-xs font-medium text-warning">{videoMetadata.musicInfo.author}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              Info musik tidak tersedia.
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground pt-1 border-t border-warning/10">
                          <strong>Credit Video:</strong> {videoMetadata.platform?.charAt(0).toUpperCase()}{videoMetadata.platform?.slice(1)}
                          {videoMetadata.author && <> • {videoMetadata.author}</>}
                          {videoMetadata.musicInfo?.author && (
                            <>
                              <br/>
                              <strong>Credit Musik:</strong> {videoMetadata.musicInfo.author}
                              {videoMetadata.musicInfo.title && <> - "{videoMetadata.musicInfo.title}"</>}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Picker options for multiple files */}
                {pickerOptions.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pickerOptions.map((option, idx) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        size="sm"
                        onClick={() => triggerDownload(option.url)}
                        className="flex flex-col h-auto py-2"
                      >
                        <Download className="w-4 h-4 mb-1" />
                        <span className="text-xs">File {idx + 1}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Single download */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetDownload} className="flex-1">
                    Download Lagi
                  </Button>
                  {downloadUrl && (
                    <Button 
                      variant="accent" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => triggerDownload(downloadUrl)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Simpan File
                    </Button>
                  )}
                </div>
              </div>
            )}

            {downloadStatus === "error" && (
              <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
                Coba Lagi
              </Button>
            )}
          </div>
        )}

        {/* Preview and Download Buttons */}
        {downloadStatus === "idle" && (
          <div className="flex gap-2">
            {!videoMetadata?.thumbnail && (
              <Button
                variant="outline"
                size="xl"
                className="flex-1"
                onClick={handlePreview}
                disabled={!url || !platform}
              >
                <Eye className="w-5 h-5" />
                Preview
              </Button>
            )}
            <Button
              variant="accent"
              size="xl"
              className={videoMetadata?.thumbnail ? "w-full" : "flex-1"}
              onClick={handleDownload}
              disabled={!url}
            >
              <Download className="w-5 h-5" />
              Download {format === "video" ? "Video" : "Audio"}
            </Button>
          </div>
        )}
      </div>

      {/* Image Download Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Image className="w-5 h-5 text-primary" />
          Download Gambar
        </div>
        
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste URL gambar di sini..."
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImagePreviewError(false);
              setImageLoaded(false);
            }}
            disabled={imageDownloading}
            className="pl-12 h-14 text-base bg-secondary/50 border-border focus:border-primary"
          />
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              Preview Gambar
            </div>
            <div className="relative rounded-lg overflow-hidden bg-secondary/30 border border-border">
              {!imageLoaded && !imagePreviewError && (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {imagePreviewError && (
                <div className="flex flex-col items-center justify-center h-48 text-destructive">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">Gagal memuat gambar</p>
                  <p className="text-xs text-muted-foreground">Pastikan URL gambar valid</p>
                </div>
              )}
              <img
                src={imageUrl}
                alt="Preview"
                className={`w-full max-h-64 object-contain ${imageLoaded && !imagePreviewError ? 'block' : 'hidden'}`}
                onLoad={() => {
                  setImageLoaded(true);
                  setImagePreviewError(false);
                }}
                onError={() => {
                  setImagePreviewError(true);
                  setImageLoaded(false);
                }}
              />
            </div>
            {imageLoaded && !imagePreviewError && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Gambar berhasil dimuat
              </p>
            )}
          </div>
        )}

        <Button
          variant="accent"
          size="lg"
          className="w-full"
          onClick={() => {
            if (!imageUrl) {
              toast({
                title: "URL Kosong",
                description: "Masukkan URL gambar yang ingin diunduh",
                variant: "destructive",
              });
              return;
            }
            if (imagePreviewError) {
              toast({
                title: "Gambar Tidak Valid",
                description: "URL gambar tidak dapat dimuat, pastikan URL benar",
                variant: "destructive",
              });
              return;
            }
            setImageDownloading(true);
            const a = document.createElement('a');
            a.href = imageUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.click();
            setTimeout(() => {
              setImageDownloading(false);
              setImageUrl("");
              setImageLoaded(false);
              toast({
                title: "Berhasil!",
                description: "Gambar sedang diunduh di tab baru",
              });
            }, 1000);
          }}
          disabled={!imageUrl || imageDownloading || imagePreviewError}
        >
          {imageDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Download Gambar
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Masukkan URL langsung ke gambar (contoh: https://example.com/image.jpg)
        </p>
      </div>
    </div>
  );
}