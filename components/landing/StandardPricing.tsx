import React, { useState } from 'react';
import AnimatedSection from './AnimatedSection';
import { CheckIcon } from '../icons/Icons';

interface StandardPricingProps {
  onStart: () => void;
}

const StandardPricing: React.FC<StandardPricingProps> = ({ onStart }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-background">
      <AnimatedSection className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Choose the plan that's right for you. Cancel anytime.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="relative max-w-md mx-auto mt-12">
          <div className="bg-panel p-8 rounded-lg border border-border shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold font-heading text-text-primary">Pro Plan</h3>
            
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
                    Save 15%
                </span>
              </button>
            </div>

            {/* Price Display */}
            <div className="mt-6 text-center">
              {billingCycle === 'monthly' ? (
                <>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-5xl font-bold text-text-primary">$49</span>
                    <span className="text-text-secondary text-lg">/ month</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-5xl font-bold text-text-primary">$499</span>
                    <span className="text-text-secondary text-lg">/ year</span>
                  </div>
                </>
              )}
            </div>
            
            <p className="text-center text-text-secondary mt-6">Start with free credits, then upgrade to Pro for unlimited simulations.</p>

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
                Get Started with Free Credits
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default StandardPricing;