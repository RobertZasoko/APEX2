import React, { useState } from 'react';
import AnimatedSection from './AnimatedSection';
import { CheckIcon } from '../icons/Icons';

interface PricingProps {
  onStart: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onStart }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [spotsLeft] = useState(87); // Static for now, can be made dynamic later

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-background">
      <AnimatedSection className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary">
            Become an Apex AI Founding Member
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            This exclusive offer is strictly limited to our first 100 customers. Lock in your lifetime discount today.
          </p>
          <p className="mt-4 text-lg font-semibold text-amber-600 animate-pulse">
            🔥 Only {spotsLeft} Founding Member spots left!
          </p>
        </div>

        {/* Pricing Card */}
        <div className="relative max-w-md mx-auto mt-12">
          <div className="bg-panel p-8 rounded-lg border border-primary shadow-2xl flex flex-col">
            <h3 className="text-2xl font-bold font-heading text-text-primary">Pro Plan (Founding Member)</h3>
            
            {/* Toggle Switch */}
            <div className="mt-6 mx-auto bg-background p-1 rounded-lg flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-panel'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${billingCycle === 'annual' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-panel'}`}
              >
                Annual
                <span className="absolute -top-2 -right-3 bg-feedback-positive/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Best Value
                </span>
              </button>
            </div>

            {/* Price Display */}
            <div className="mt-6 text-center">
              {billingCycle === 'monthly' ? (
                <>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-5xl font-bold text-text-primary">$29</span>
                    <span className="text-text-secondary text-lg">/ month</span>
                  </div>
                  <p className="text-text-secondary line-through mt-1">$49/month</p>
                </>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-5xl font-bold text-text-primary">$299</span>
                    <span className="text-text-secondary text-lg">/ year</span>
                  </div>
                   <p className="text-text-secondary line-through mt-1">$499/year</p>
                </>
              )}
            </div>
            
            <p className="text-center text-text-secondary mt-6">Start with a 14-day, no-risk free trial.</p>

            <ul className="mt-8 space-y-4 text-text-secondary flex-grow">
              {[
                'Unlimited AI Call Simulations',
                'Full Access to Persona Library',
                'Instant Performance Scorecards & Feedback',
                'Personal Progress Dashboard',
                'Call Transcript History',
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span className="text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button onClick={onStart} className="block w-full text-center font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 bg-primary text-white hover:bg-primary-hover">
                Start Free Trial & Lock In My Rate
              </button>
            </div>
          </div>
        </div>

        {/* Founding Member Benefits */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">Your Role as a Co-Creator</h3>
          <p className="mt-4 text-lg text-text-secondary">
            As a Founding Member, you're more than just a customer—you're a crucial partner in our journey. In exchange for this permanent discount, we ask for your honest feedback to help us build the future of sales training.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-left">
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h4 className="text-lg font-semibold text-text-primary">A Price That Never Increases</h4>
              <p className="mt-2 text-text-secondary">
                Your discounted rate is locked in for life. You will never pay the standard price, even as we add more premium features.
              </p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h4 className="text-lg font-semibold text-text-primary">Shape the Product Roadmap</h4>
              <p className="mt-2 text-text-secondary">
                Your voice matters. We will actively seek your feedback and suggestions, giving you a direct influence on the features we build next.
              </p>
            </div>
          </div>
        </div>

      </AnimatedSection>
    </section>
  );
};

export default Pricing;
