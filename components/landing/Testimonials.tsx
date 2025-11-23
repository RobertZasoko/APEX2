import React from 'react';
import AnimatedSection from './AnimatedSection';

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-panel">
      <AnimatedSection className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary">
            Trusted by Top-Performing Sales Teams
          </h2>
        </div>
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-background p-8 rounded-lg border border-border text-center">
            <p className="text-xl text-text-primary leading-relaxed">
              "Apex AI is a game-changer. I ran ten discovery calls in one afternoon and immediately identified a critical flaw in my questioning. My confidence has skyrocketed."
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                JD
              </div>
              <div>
                <p className="font-semibold text-text-primary">Jane Doe</p>
                <p className="text-text-secondary">Account Executive, SaaS Corp</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default Testimonials;
