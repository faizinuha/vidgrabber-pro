import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

type PlatformKey = "tiktok" | "instagram" | "facebook" | "youtube";

interface GuideStep {
  step: number;
  text: string;
}

interface PlatformGuide {
  name: string;
  icon: string;
  color: string;
  steps: GuideStep[];
}

const guides: Record<PlatformKey, PlatformGuide> = {
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    color: "border-pink-500/30 hover:border-pink-500/50",
    steps: [
      { step: 1, text: "Buka aplikasi TikTok atau website tiktok.com" },
      { step: 2, text: "Cari video yang ingin diunduh" },
      { step: 3, text: "Tekan tombol Share (panah ke samping)" },
      { step: 4, text: "Pilih 'Copy Link' atau 'Salin Tautan'" },
      { step: 5, text: "Paste link di kolom input di atas" },
    ],
  },
  instagram: {
    name: "Instagram",
    icon: "📸",
    color: "border-purple-500/30 hover:border-purple-500/50",
    steps: [
      { step: 1, text: "Buka aplikasi Instagram atau instagram.com" },
      { step: 2, text: "Buka Reels atau video yang ingin diunduh" },
      { step: 3, text: "Tekan ikon tiga titik (...) di pojok kanan" },
      { step: 4, text: "Pilih 'Copy Link' atau 'Salin Tautan'" },
      { step: 5, text: "Paste link di kolom input di atas" },
    ],
  },
  facebook: {
    name: "Facebook",
    icon: "👥",
    color: "border-blue-500/30 hover:border-blue-500/50",
    steps: [
      { step: 1, text: "Buka aplikasi Facebook atau facebook.com" },
      { step: 2, text: "Cari video yang ingin diunduh" },
      { step: 3, text: "Tekan tombol Share di bawah video" },
      { step: 4, text: "Pilih 'Copy Link' atau 'Salin'" },
      { step: 5, text: "Paste link di kolom input di atas" },
    ],
  },
  youtube: {
    name: "YouTube",
    icon: "▶️",
    color: "border-red-500/30 hover:border-red-500/50",
    steps: [
      { step: 1, text: "Buka aplikasi YouTube atau youtube.com" },
      { step: 2, text: "Buka video yang ingin diunduh" },
      { step: 3, text: "Tekan tombol Share (panah)" },
      { step: 4, text: "Pilih 'Copy Link' atau salin dari address bar" },
      { step: 5, text: "Paste link di kolom input di atas" },
    ],
  },
};

export function PlatformGuides() {
  const [openGuide, setOpenGuide] = useState<PlatformKey | null>(null);

  const toggleGuide = (platform: PlatformKey) => {
    setOpenGuide(openGuide === platform ? null : platform);
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Cara Download per Platform
      </h2>
      <div className="space-y-3">
        {(Object.keys(guides) as PlatformKey[]).map((key) => {
          const guide = guides[key];
          const isOpen = openGuide === key;

          return (
            <div
              key={key}
              className={`glass-card border transition-colors ${guide.color}`}
            >
              <button
                onClick={() => toggleGuide(key)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{guide.icon}</span>
                  <span className="font-medium">{guide.name}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {guide.steps.map((step) => (
                      <li key={step.step} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                          {step.step}
                        </span>
                        <span>{step.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
