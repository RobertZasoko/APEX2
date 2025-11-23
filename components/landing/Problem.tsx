import React from 'react';
import AnimatedSection from './AnimatedSection';
import { ProblemCalendarIcon, ProblemDollarIcon, ProblemUserIcon } from '../icons/Icons';

const ProblemCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-panel p-6 rounded-lg border border-border text-center">
    <div className="inline-block bg-primary/10 p-3 rounded-full text-primary">
      {icon}
    </div>
    <h3 className="mt-4 text-xl font-bold font-heading text-text-primary">{title}</h3>
    <p className="mt-2 text-text-secondary">{children}</p>
  </div>
);

const Problem: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-panel">
      <AnimatedSection className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary">
            Stop Practicing on Your Prospects
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Role-playing is awkward. Practicing on real clients is expensive.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProblemCard
            icon={<ProblemUserIcon className="w-8 h-8" />}
            title="No Objective Feedback"
          >
            Team role-play is biased and often too polite. You never know where you truly need to improve.
          </ProblemCard>
          <ProblemCard
            icon={<ProblemCalendarIcon className="w-8 h-8" />}
            title="Lack of Repetition"
          >
            You can't practice the same high-stakes scenario ten times in a row to build muscle memory.
          </ProblemCard>
          <ProblemCard
            icon={<ProblemDollarIcon className="w-8 h-8" />}
            title="Lost Opportunities"
          >
            Every real call you use for "practice" is a potential deal you're putting at risk.
          </ProblemCard>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default Problem;
