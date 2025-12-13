import { Download } from "lucide-react";

export function Header() {
  return (
    <header className="text-center space-y-3">
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center glow-box">
          <Download className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          <span className="gradient-text">Video</span>
          <span className="text-foreground">Grab</span>
        </h1>
      </div>
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
        Download video dari TikTok, Instagram, Facebook & YouTube. 
        Gratis, tanpa iklan, tanpa registrasi.
      </p>
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
          TikTok
        </span>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Instagram
        </span>
        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Facebook
        </span>
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          YouTube
        </span>
      </div>
    </header>
  );
}
