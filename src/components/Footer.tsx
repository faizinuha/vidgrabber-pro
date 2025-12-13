import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="text-center py-6 border-t border-border">
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        Dibuat dengan <Heart className="w-3 h-3 text-destructive" /> untuk komunitas
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        © {new Date().getFullYear()} VideoGrab. Semua hak dilindungi.
      </p>
    </footer>
  );
}
