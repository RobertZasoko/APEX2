import React from 'react';
import AppGif from './AppGif';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold font-heading text-text-primary leading-tight animate-fade-in">
          Master Your Sales Calls with an AI Sparring Partner
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary leading-relaxed animate-fade-in-delay-1">
          Apex AI is a real-time voice simulator that lets you practice high-stakes calls against a challenging AI client. Build confidence and close deals under pressure.
        </p>
        <div className="mt-10 animate-fade-in-delay-2">
          <button
            onClick={onStart}
            className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Start Your First Simulation Free
          </button>
        </div>
        <div className="mt-16 max-w-3xl mx-auto animate-fade-in-delay-3">
           <AppGif />
        </div>
      </div>
    </section>
  );
};

export default Hero;