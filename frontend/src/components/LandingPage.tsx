'use client'

import SmoothScrollProvider from './SmoothScrollProvider'
import Navigation from '../sections/Navigation'
import HeroSection from '../sections/HeroSection'
import TrustedByBar from '../sections/TrustedByBar'
import FeaturesSection from '../sections/FeaturesSection'
import HowItWorksSection from '../sections/HowItWorksSection'
import IndustriesSection from '../sections/IndustriesSection'
import ParallaxShowcase from '../sections/ParallaxShowcase'
import PricingSection from '../sections/PricingSection'
import FAQSection from '../sections/FAQSection'
import Footer from '../sections/Footer'

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <Navigation />
      <main>
        <HeroSection />
        <TrustedByBar />
        <FeaturesSection />
        <HowItWorksSection />
        <IndustriesSection />
        <ParallaxShowcase />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
