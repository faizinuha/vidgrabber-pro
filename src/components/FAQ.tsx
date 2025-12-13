import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Apakah website ini legal dan aman?",
    answer:
      "Ya, website ini 100% aman digunakan. Kami tidak menyimpan data pribadi Anda dan tidak mengumpulkan informasi apapun. Proses download dilakukan secara langsung dari server asli platform. Untuk aspek legal, unduhan untuk penggunaan pribadi umumnya diperbolehkan, namun dilarang untuk mendistribusikan ulang konten tanpa izin pemilik.",
  },
  {
    question: "Mengapa tidak ada iklan di website ini?",
    answer:
      "Kami percaya pengalaman pengguna adalah yang utama. Tanpa iklan, website ini lebih cepat, lebih bersih, dan lebih aman. Kami mengandalkan dukungan sukarela dari pengguna yang merasa terbantu dengan layanan ini.",
  },
  {
    question: "Bagaimana cara mendukung website ini?",
    answer:
      "Anda dapat mendukung kami melalui donasi. Minimal Rp 5.000 untuk membuka fitur download resolusi 4K. Setiap dukungan membantu kami untuk terus mengembangkan dan mempertahankan layanan gratis ini.",
  },
  {
    question: "Apa perbedaan format Video dan Audio?",
    answer:
      "Format Video akan mengunduh file video lengkap dengan suara. Format Audio hanya mengunduh bagian suara/musik dalam format MP3, cocok untuk lagu atau podcast.",
  },
  {
    question: "Mengapa resolusi 4K membutuhkan donasi?",
    answer:
      "Proses download resolusi 4K membutuhkan bandwidth dan resource server yang lebih besar. Donasi minimal Rp 5.000 membantu kami menutupi biaya operasional untuk menyediakan kualitas tertinggi.",
  },
  {
    question: "Apakah ada batasan download?",
    answer:
      "Tidak ada batasan untuk download resolusi 720p dan 1080p. Anda bisa download sebanyak yang Anda mau, kapan saja.",
  },
  {
    question: "Platform apa saja yang didukung?",
    answer:
      "Saat ini kami mendukung TikTok, Instagram (Reels & Posts), Facebook, dan YouTube. Kami akan terus menambah platform lain di masa depan.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Pertanyaan Umum (FAQ)
      </h2>
      <div className="space-y-2">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={index} className="glass-card border border-border">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 flex items-start justify-between text-left gap-4"
              >
                <span className="font-medium text-sm">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
