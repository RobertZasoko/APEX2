import React from 'react';
import AnimatedSection from './AnimatedSection';

interface CtaProps {
  onStart: () => void;
}

const Cta: React.FC<CtaProps> = ({ onStart }) => {
  return (
    <section className="bg-panel py-20 sm:py-28">
      <AnimatedSection className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary">
          Ready to Close More Deals?
        </h2>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          Click below to run your first simulation. It's free, takes less than 5 minutes, and you'll get instant, actionable feedback to improve your very next call.
        </p>
        <div className="mt-8">
          <button
            onClick={onStart}
            className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Start Your First Simulation Free
          </button>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default Cta;