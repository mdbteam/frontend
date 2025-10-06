// src/pages/HomePage.tsx
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { Testimonials } from '../components/home/Testimonials';

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <Testimonials /> 
    </>
  );
}

export default HomePage;