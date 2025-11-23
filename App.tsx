import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Scenario, TranscriptMessage, UserProfile, CallRecord, Feedback, SavedScenario } from './types';
import { generateFeedback } from './services/geminiService';
import { auth, onAuthStateChanged, signOut, getUserProfile, getSimulations, saveSimulation, updateUserProfile, deleteSimulation, deleteMultipleSimulations } from './services/firebase';

// Landing Page Components
import Header from './components/landing/Header';
import Hero from './components/landing/Hero';
import Problem from './components/landing/Problem';
import Solution from './components/landing/Solution';
import Features from './components/landing/Features';
import Pricing from './components/landing/Pricing';
import Cta from './components/landing/Cta';
import Footer from './components/landing/Footer';

// App Components
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import SetupScreen from './components/SetupScreen';
import CallScreen from './components/CallScreen';
import FeedbackScreen from './components/FeedbackScreen';
import ProfileScreen from './components/ProfileScreen';
import { LoadingIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentAudioDeviceId, setCurrentAudioDeviceId] = useState<string | undefined>(undefined);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [currentCallRecordingUrl, setCurrentCallRecordingUrl] = useState<string | null>(null);
  const [deletingState, setDeletingState] = useState<{ recordIds: string[], scenarioId: string | null }>({ recordIds: [], scenarioId: null });


  const handleStartApp = useCallback(() => {
    setView('app');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // If user has no display name, they need to go through onboarding.
          // This happens for new email/password signups.
          if (!firebaseUser.displayName) {
            setAppState(AppState.ONBOARDING);
            setView('app');
            return;
          }
          
          let userProfileData = await getUserProfile(firebaseUser.uid);

          // If firestore profile doesn't exist, it's a new user whose profile
          // is being created by a backend function. We'll poll for it.
          if (!userProfileData) {
            const pollForProfile = async (retries = 5, delay = 1000): Promise<Omit<UserProfile, 'callHistory'> | null> => {
                for (let i = 0; i < retries; i++) {
                    const profile = await getUserProfile(firebaseUser.uid);
                    if (profile) return profile;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                return null;
            };
            
            userProfileData = await pollForProfile();

            if (!userProfileData) {
              console.error("User profile was not found or created by the backend in time.");
              alert("There was a problem setting up your account. Please try logging in again.");
              await signOut(auth);
              return; // This will trigger the signed-out state path
            }
          }
          
          const simulations = await getSimulations(firebaseUser.uid);
          const fullUserProfile: UserProfile = {
              ...userProfileData,
              callHistory: simulations,
          };
          setUser(fullUserProfile);
          setAppState(AppState.SETUP);
          setView('app');

        } else {
          // User is signed out.
          setUser(null);
          setAppState(AppState.LOGIN);
        }
      } catch (error) {
        console.error("Failed to process auth state change:", error);
        // Reset to a known safe state on error
        setUser(null);
        setAppState(AppState.LOGIN);
        setView('landing');
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = useCallback(async () => {
    try {
        await signOut(auth);
        setUser(null);
        setAppState(AppState.LOGIN);
        setView('landing'); 
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
    }
  }, []);
  
  const handleSubscriptionSuccess = useCallback((subscriptionDetails: Partial<UserProfile>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...subscriptionDetails };
    });
    setAppState(AppState.SETUP);
  }, []);

  const handleStartCall = useCallback((scenario: Scenario, audioDeviceId?: string) => {
    if (!user) return;

    const isPro = user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'founder';
    
    // It's possible trialEndDate is a Firestore Timestamp. If so, convert it to a Date.
    const trialEndDateAsDate = user.trialEndDate && (user.trialEndDate as any).toDate 
      ? (user.trialEndDate as any).toDate() 
      : user.trialEndDate;

    const isTrialActive = trialEndDateAsDate && trialEndDateAsDate >= new Date();

    if (!isPro && !isTrialActive) {
        setAppState(AppState.SUBSCRIPTION);
        return;
    }

    setCurrentScenario(scenario);
    setCurrentAudioDeviceId(audioDeviceId);
    setAppState(AppState.IN_CALL);
  }, [user]);

  const handleSaveScenario = useCallback(async (scenario: Scenario, name: string) => {
    if (!user) return;
    const newScenario: SavedScenario = {
      ...scenario,
      id: `custom-${new Date().toISOString()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
    };
    const updatedScenarios = [...user.savedScenarios, newScenario];
    
    await updateUserProfile(user.id, { savedScenarios: updatedScenarios });
    
    setUser(prevUser => prevUser ? { ...prevUser, savedScenarios: updatedScenarios } : null);
    alert(`Scenario "${name}" saved!`);
  }, [user]);
  
  const handleDeleteScenario = useCallback(async (scenarioId: string) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this custom scenario?')) {
        return;
    }

    setDeletingState(prev => ({ ...prev, scenarioId }));
    try {
        const updatedScenarios = user.savedScenarios.filter(s => s.id !== scenarioId);
        await updateUserProfile(user.id, { savedScenarios: updatedScenarios });
        
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, savedScenarios: updatedScenarios };
        });

    } catch (error) {
        console.error("Failed to delete scenario:", error);
        alert("There was an error deleting the custom scenario. Please try again.");
    } finally {
        setDeletingState(prev => ({ ...prev, scenarioId: null }));
    }
  }, [user]);


  const handleEndCall = useCallback(async (transcript: TranscriptMessage[], audioUrl: string | null) => {
    if (!currentScenario || !user) return;
    
    setAppState(AppState.GENERATING_FEEDBACK);
    setCurrentCallRecordingUrl(audioUrl);

    try {
      const feedback = await generateFeedback(currentScenario, transcript);
      setCurrentFeedback(feedback);

      const newRecordForDb = {
        scenario: currentScenario,
        transcript,
        feedback,
        callRecordingUrl: audioUrl,
      };
      const newRecordId = await saveSimulation(user.id, newRecordForDb);

      // Optimistically update local state to show the new record immediately
      const newRecordForState: CallRecord = {
        id: newRecordId, // Use the real ID from Firestore
        date: new Date().toLocaleString(),
        ...newRecordForDb,
      };

      setUser(prevUser => prevUser ? { ...prevUser, callHistory: [newRecordForState, ...prevUser.callHistory] } : null);
      setAppState(AppState.FEEDBACK);
    } catch (error)
 {
      console.error("Failed to generate feedback:", error);
      alert("There was an error generating your feedback. Please try another call.");
      setAppState(AppState.SETUP);
    }
  }, [currentScenario, user]);

  const handleNewCall = useCallback(() => {
    setCurrentScenario(null);
    setCurrentFeedback(null);
    setCurrentCallRecordingUrl(null);
    setAppState(AppState.SETUP);
  }, []);

  const handleViewHistory = useCallback(() => {
    setAppState(AppState.PROFILE);
  }, []);
  
  const handleBackToSetup = useCallback(() => {
    setAppState(AppState.SETUP);
  }, []);

  const handleDeleteCallRecord = useCallback(async (recordId: string) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this call record? This action cannot be undone.')) {
        return;
    }

    setDeletingState(prev => ({ ...prev, recordIds: [recordId] }));
    try {
        await deleteSimulation(user.id, recordId);
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedHistory = currentUser.callHistory.filter(record => record.id !== recordId);
            return { ...currentUser, callHistory: updatedHistory };
        });
    } catch (error) {
        console.error("Failed to delete call record:", error);
        alert("There was an error deleting the call record. Please try again.");
    } finally {
        setDeletingState(prev => ({ ...prev, recordIds: [] }));
    }
  }, [user]);

  const handleDeleteMultipleCallRecords = useCallback(async (recordIds: string[]) => {
    if (!user || recordIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${recordIds.length} call records? This action cannot be undone.`)) {
        return;
    }

    setDeletingState(prev => ({ ...prev, recordIds }));
    try {
        await deleteMultipleSimulations(user.id, recordIds);
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedHistory = currentUser.callHistory.filter(record => !recordIds.includes(record.id));
            return { ...currentUser, callHistory: updatedHistory };
        });
    } catch (error) {
        console.error("Failed to delete multiple call records:", error);
        alert("There was an error deleting the selected records. Please try again.");
    } finally {
        setDeletingState(prev => ({ ...prev, recordIds: [] }));
    }
  }, [user]);

  if (isAuthLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <LoadingIcon className="w-12 h-12 text-primary" />
        </div>
    );
  }

  if (view === 'landing' && !user) {
    return (
      <div className="bg-background text-text-primary font-body">
        <Header onStart={handleStartApp} />
        <main>
          <Hero onStart={handleStartApp} />
          <Problem />
          <Solution />
          <Features />
          <Pricing onStart={handleStartApp} />
          <Cta onStart={handleStartApp} />
        </main>
        <Footer />
      </div>
    );
  }

  const renderAppContent = () => {
    if (appState === AppState.LOGIN) {
      return <LoginScreen />;
    }
    if (appState === AppState.ONBOARDING) {
      return <OnboardingScreen />;
    }
    
    // All states below require a user object.
    if (!user) {
      // If we're in a state that needs a user but don't have one, show a loader
      // to allow time for the auth state to resolve.
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <LoadingIcon className="w-12 h-12 text-primary" />
        </div>
      );
    }

    switch (appState) {
      case AppState.SUBSCRIPTION:
        return <SubscriptionScreen user={user} onSubscriptionSuccess={handleSubscriptionSuccess} />;
      case AppState.SETUP:
        return <SetupScreen user={user} onStartCall={handleStartCall} onViewHistory={handleViewHistory} onLogout={handleLogout} onSaveScenario={handleSaveScenario} onDeleteScenario={handleDeleteScenario} deletingScenarioId={deletingState.scenarioId} />;
      case AppState.IN_CALL:
        return <CallScreen scenario={currentScenario!} onEndCall={handleEndCall} onBack={handleBackToSetup} audioDeviceId={currentAudioDeviceId} />;
      case AppState.GENERATING_FEEDBACK:
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-background text-center">
                <LoadingIcon className="w-12 h-12 text-primary" />
                <h1 className="text-2xl font-semibold mt-4 text-text-primary font-heading">Analyzing your call...</h1>
                <p className="text-text-secondary mt-2">Your feedback is being generated by our AI coach.</p>
            </div>
        );
      case AppState.FEEDBACK:
        return <FeedbackScreen feedback={currentFeedback!} onNewCall={handleNewCall} onViewHistory={handleViewHistory} callRecordingUrl={currentCallRecordingUrl} />;
      case AppState.PROFILE:
        return <ProfileScreen user={user} onBack={handleBackToSetup} onLogout={handleLogout} onStartCall={handleStartCall} onDeleteCallRecord={handleDeleteCallRecord} onDeleteMultipleCallRecords={handleDeleteMultipleCallRecords} deletingRecordIds={deletingState.recordIds} />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <div className="App">
      {renderAppContent()}
    </div>
  );
};

export default App;