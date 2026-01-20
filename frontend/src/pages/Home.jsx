import React from 'react';
import '../styles/Home.css'
import Header from "../components/Header"
import HeroSection from "../components/HeroSection"
import ServicesSection from "../components/ServicesSection"
import FeaturesSection from "../components/FeaturesSection"
import Footer from "../components/Footer"
import DescriptionSection from "../components/DescriptionSection"
import FaqSection from '../components/FaqSection';
import About from '../components/About';    


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
