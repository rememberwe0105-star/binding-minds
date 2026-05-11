import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { TrendingNow } from '@/components/TrendingNow';
import { ImpactStories } from '@/components/ImpactStories';
import { Features } from '@/components/Features';
import { FeaturedCharities } from '@/components/FeaturedCharities';
import { TaxTeaser } from '@/components/TaxTeaser';
import { Footer } from '@/components/Footer';
import { LiveToast } from '@/components/LiveToast';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrendingNow />
        <ImpactStories />
        <Features />
        <FeaturedCharities />
        <TaxTeaser />
      </main>
      <Footer />
      <LiveToast />
    </>
  );
}
