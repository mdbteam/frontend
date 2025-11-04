import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { Testimonials } from '../components/home/Testimonials';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
      {/* <FeaturedProviders /> */}
      <Testimonials />
    </>
  );
}