import React from 'react';
import AnimatedSection from './AnimatedSection';

const Step: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="relative pl-16">
    <div className="absolute left-0 top-0 text-6xl font-bold font-heading text-primary/20">
      {number}
    </div>
    <h3 className="text-xl font-bold font-heading text-text-primary">{title}</h3>
    <p className="mt-2 text-text-secondary">{children}</p>
  </div>
);

const Solution: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <AnimatedSection className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary">
            Your 24/7 AI Sales Coach
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <Step number="01" title="Set the Scenario">
            Choose your client's role, industry, and objection style before you start the call.
          </Step>
          <Step number="02" title="Run the Simulation">
            Engage in a realistic, real-time voice conversation with our intelligent AI persona.
          </Step>
          <Step number="03" title="Get Instant, Actionable Feedback">
            End the call to receive a detailed performance scorecard with your strengths and specific areas for improvement.
          </Step>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default Solution;
