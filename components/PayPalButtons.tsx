import React, { useEffect, useRef, useState } from 'react';
import { updateUserProfile } from '../services/firebase';
import { UserProfile } from '../types';
import { LoadingIcon } from './icons/Icons';

// This is an unsafe, client-side only subscription flow.
// In a production environment, you MUST use a backend with webhooks
// to securely process subscriptions and grant access.
// The `onApprove` function should only notify your backend,
// which then verifies the subscription with PayPal before updating the user's status.

// Sandbox Plan IDs for testing. Replace with your actual Plan IDs from your PayPal Developer Dashboard.
const PLAN_IDS = {
  monthly: 'P-35G21975A2229154BMYC636Q', // Example Sandbox Monthly Plan ID
  annual: 'P-57N248245R569523YMYC65BA',   // Example Sandbox Annual Plan ID
};

interface PayPalButtonsProps {
  userId: string;
  planId: string;
  onSuccess: (details: Partial<UserProfile>) => void;
}

const PayPalButtons: React.FC<PayPalButtonsProps> = ({ userId, planId, onSuccess }) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paypalRef.current) return;

    // @ts-ignore
    if (typeof window.paypal?.Buttons !== 'function') {
      setError("PayPal SDK failed to load. Please check your internet connection and refresh the page.");
      return;
    }

    if (planId.includes('P-YOUR-')) {
      setError('PayPal Plan ID is not configured. Please update the PLAN_IDS in PayPalButtons.tsx');
      return;
    }

    let buttons: any; // Use a local variable to hold the instance for cleanup

    try {
      paypalRef.current.innerHTML = ''; // Clear previous buttons to prevent duplicates

      // @ts-ignore - This is now safe due to the check above
      buttons = window.paypal.Buttons({
        createSubscription: (data: any, actions: any) => {
          setError(null);
          return actions.subscription.create({
            plan_id: planId,
            custom_id: userId, // Pass the user's ID for tracking
          });
        },
        onApprove: async (data: any, actions: any) => {
          setIsLoading(true);
          setError(null);
          try {
            const subscriptionDetails: Partial<UserProfile> = {
              subscriptionStatus: 'pro',
              subscriptionProvider: 'paypal',
              paypalSubscriptionId: data.subscriptionID,
              freeCredits: 0, // Set free credits to 0 upon Pro subscription
            };
            
            // DANGER: Client-side entitlement. See warning above.
            await updateUserProfile(userId, subscriptionDetails);
            
            onSuccess(subscriptionDetails);

          } catch (err) {
            console.error("Failed to update user profile after subscription:", err);
            setError("Your payment was successful, but there was an issue activating your account. Please contact support.");
          } finally {
              setIsLoading(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal button error:', err);
           // The err object can be complex. We try to find a meaningful message.
          const message = typeof err === 'object' && err !== null && err.message 
              ? String(err.message) 
              : "An error occurred with the payment process. Please try again.";
          setError(message);
        },
        onCancel: () => {
          // No user-facing error on cancel, but you can log it.
          console.log("User cancelled the payment.");
        }
      });

      // The render method can return a promise that rejects on error.
      buttons.render(paypalRef.current).catch((renderError: any) => {
        console.error("PayPal button render error:", renderError);
        setError("Could not display payment options. Please refresh and try again.");
      });

    } catch (e) {
      console.error("Error initializing PayPal Buttons:", e);
      setError("Could not display payment options. Please refresh the page or try again later.");
    }
    
    // Return a cleanup function
    return () => {
      if (buttons) {
        buttons.close().catch((closeError: any) => {
          // Log cleanup errors but don't show to user as they are likely navigating away
          console.error("Error closing PayPal Buttons:", closeError);
        });
      }
    };
  }, [planId, userId, onSuccess]); 

  return (
    <div>
        {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
                <LoadingIcon className="w-10 h-10 text-primary" />
                <p className="mt-4 text-text-secondary font-semibold">Processing your subscription...</p>
                <p className="text-sm text-text-secondary">Please do not close this window.</p>
            </div>
        ) : (
            <>
                <div ref={paypalRef} />
                {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
            </>
        )}
    </div>
  );
};

export default PayPalButtons;
