import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center items-start px-6 sm:px-8 max-w-6xl mx-auto">
      <div className="animate-fade-in-up">
        <p className="text-teal-200 font-mono text-sm sm:text-base mb-4 animate-fade-in-up delay-100">
          Hi, my name is
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up delay-200">
          Alex Johnson
        </h1>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white/60 mb-6 animate-fade-in-up delay-300">
          I build things for the web.
        </h2>
        <p className="text-white/70 max-w-2xl text-base sm:text-lg leading-relaxed mb-12 animate-fade-in-up delay-400">
          I'm a full-stack developer specializing in building exceptional digital experiences. 
          Currently focused on creating accessible, human-centered products with modern technologies.
        </p>
        <button 
          onClick={scrollToAbout}
          className="group bg-transparent border-2 border-teal-400 text-teal-400 px-8 py-4 rounded-lg font-mono text-sm hover:bg-teal-400/10 transition-all duration-300 animate-fade-in-up delay-500"
        >
          Get to know me
          <ChevronDown className="inline ml-2 w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default Hero;