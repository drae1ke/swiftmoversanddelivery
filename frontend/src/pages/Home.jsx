import React from 'react';
import '../styles/Home.css'
import Header from "../components/common/Header"
import HeroSection from "../components/common/HeroSection"
import ServicesSection from "../components/common/ServicesSection"
import FeaturesSection from "../components/common/FeaturesSection"
import Footer from "../components/common/Footer"
import DescriptionSection from "../components/common/DescriptionSection"
import FaqSection from '../components/common/FaqSection';
import About from '../components/common/About';    


const Home = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <DescriptionSection />
      <FeaturesSection />
      <ServicesSection />
      <FaqSection />
      <About />
      <Footer />
    </>
  )
}

export default Home
