import { Shield, Lock, Eye } from "lucide-react";

export function LegalNotice() {
  return (
    <section className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Keamanan & Legalitas
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-success">
              <Lock className="w-4 h-4" />
              <span className="font-medium text-sm">100% Aman</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tidak ada malware, virus, atau script berbahaya. Website ini hanya 
              memproses URL yang Anda berikan tanpa menyimpan data apapun.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-info">
              <Eye className="w-4 h-4" />
              <span className="font-medium text-sm">Privasi Terjaga</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Kami tidak mengumpulkan, menyimpan, atau membagikan informasi 
              pribadi Anda. Tidak ada cookie tracking atau analitik invasif.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> Layanan ini ditujukan untuk 
            penggunaan pribadi. Pengguna bertanggung jawab penuh atas konten yang 
            diunduh. Harap hormati hak cipta dan jangan mendistribusikan ulang 
            konten tanpa izin dari pemilik asli.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">APi :</strong> Layan ini Menggunakan Api 
            Dari sumberny dari @CobaltApi Terima kasih
          </p>
          
        </div>
      </div>
    </section>
  );
}
