import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { TrendingNow } from '@/components/TrendingNow';
import { HowItWorks } from '@/components/HowItWorks';
import { ImpactCounter } from '@/components/ImpactCounter';
import { ImpactStories } from '@/components/ImpactStories';
import { TaxTeaser } from '@/components/TaxTeaser';
import { TrustSection } from '@/components/TrustSection';
import { Footer } from '@/components/Footer';
import { LiveToast } from '@/components/LiveToast';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrendingNow />
        <HowItWorks />
        <ImpactCounter />
        <ImpactStories />
        <TaxTeaser />
        <TrustSection />
      </main>
      <Footer />
      <LiveToast />
    </>
  );
}
