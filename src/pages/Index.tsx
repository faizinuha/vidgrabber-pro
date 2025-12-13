import { Header } from "@/components/Header";
import { DownloadForm } from "@/components/DownloadForm";
import { PlatformGuides } from "@/components/PlatformGuides";
import { FAQ } from "@/components/FAQ";
import { SupportSection } from "@/components/SupportSection";
import { LegalNotice } from "@/components/LegalNotice";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 sm:py-12 space-y-12">
        <Header />
        <DownloadForm />
        <PlatformGuides />
        <FAQ />
        <SupportSection />
        <LegalNotice />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
