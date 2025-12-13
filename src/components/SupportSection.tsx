import { Button } from "@/components/ui/button";
import { Heart, ExternalLink } from "lucide-react";

const TRAKTEER_URL = "https://trakteer.id/MyCici/gift";

export function SupportSection() {
  return (
    <section className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-6 border border-warning/30 bg-warning/5">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-warning" />
            <h2 className="text-xl font-semibold">Dukung Kami</h2>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Website ini gratis tanpa iklan. Dukungan Anda membantu kami menjaga 
            layanan tetap berjalan dan terus berkembang.
          </p>

          <a
            href={TRAKTEER_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="donate" size="lg" className="gap-2">
              <ExternalLink className="w-5 h-5" />
              Donate via Trakteer
            </Button>
          </a>

          <p className="text-xs text-muted-foreground">
            Donate bebas untuk mendapatkan akses resolusi 4K
          </p>
        </div>
      </div>
    </section>
  );
}
