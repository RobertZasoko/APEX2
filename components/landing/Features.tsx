import React from 'react';
import AnimatedSection from './AnimatedSection';
import { SetupScreenshot, FeedbackScreenshot } from './FeatureScreenshots';

const FeatureRow: React.FC<{
  title: string;
  children: React.ReactNode;
  imageComponent: React.ReactNode;
  reverse?: boolean;
}> = ({ title, children, imageComponent, reverse = false }) => {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-20`}>
      <div className="md:w-1/2">
        <h3 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">{title}</h3>
        <p className="mt-4 text-lg text-text-secondary leading-relaxed">
          {children}
        </p>
      </div>
      <div className="md:w-1/2 w-full">
        {imageComponent}
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 bg-background">
      <AnimatedSection className="max-w-6xl mx-auto px-4 space-y-20 sm:space-y-28">
        <FeatureRow
          title="Unlimited, Realistic Personas"
          imageComponent={<SetupScreenshot />}
        >
          Practice against any type of client—from the skeptical COO to the friendly but busy manager. Never be caught off guard again.
        </FeatureRow>
        <FeatureRow
          title="Instant Performance Scorecard"
          imageComponent={<FeedbackScreenshot />}
          reverse
        >
          Our AI coach analyzes your entire conversation, scoring you on key metrics like talk-listen ratio, question quality, and objection handling.
        </FeatureRow>
      </AnimatedSection>
    </section>
  );
};

export default Features;