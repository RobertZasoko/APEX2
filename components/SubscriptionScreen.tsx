import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CheckIcon, RobotIcon } from './icons/Icons';
import PayPalButtons from './PayPalButtons';

interface SubscriptionScreenProps {
  user: UserProfile;
  onSubscriptionSuccess: (details: Partial<UserProfile>) => void;
}

// These should match the sandbox plan IDs in PayPalButtons.tsx
// In production, these should be your actual live Plan IDs.
const PLAN_IDS = {
  monthly: 'P-35G21975A2229154BMYC636Q',
  annual: 'P-57N248245R569523YMYC65BA',
};

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ user, onSubscriptionSuccess }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  const selectedPlanId = billingCycle === 'annual' ? PLAN_IDS.annual : PLAN_IDS.monthly;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-panel p-8 rounded-lg shadow-sm border border-border">
        <div className="text-center">
          <RobotIcon className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-semibold text-text-primary mt-4 font-heading">Free Credits Depleted</h1>
          <p className="text-text-secondary mt-2">You've used all your free credits. Subscribe to the Pro Plan for unlimited AI call simulations and unlock your full potential.</p>
        </div>

        <div className="mt-8">
          <div className="bg-panel p-6 rounded-lg border border-border flex flex-col">
            {/* Toggle Switch */}
            <div className="mx-auto bg-background p-1 rounded-lg flex items-center space-x-1">
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
                  Save 40%
                </span>
              </button>
            </div>

            {/* Price Display */}
            <div className="mt-6 text-center">
              {billingCycle === 'monthly' ? (
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-bold text-text-primary">$29</span>
                  <span className="text-text-secondary text-lg">/ month</span>
                </div>
              ) : (
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-bold text-text-primary">$299</span>
                  <span className="text-text-secondary text-lg">/ year</span>
                </div>
              )}
            </div>

            <ul className="mt-8 space-y-3 text-text-secondary">
              {[
                'Unlimited AI Call Simulations',
                'Full Access to Persona Library',
                'Instant Performance Scorecards',
                'Personal Progress Dashboard',
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
                <p className="text-center text-xs text-text-secondary mb-4">
                    Complete your secure payment with PayPal. You can cancel your subscription at any time.
                </p>
                <PayPalButtons
                    key={selectedPlanId} // Use key to force re-render when plan changes
                    userId={user.id}
                    planId={selectedPlanId}
                    onSuccess={onSubscriptionSuccess}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;