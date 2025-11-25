import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Scenario, TranscriptMessage, UserProfile, CallRecord, Feedback, SavedScenario } from './types';
import { generateFeedback } from './services/geminiService';
import { auth, onAuthStateChanged, signOut, getUserProfile, getSimulations, saveSimulation, updateUserProfile, deleteSimulation, deleteMultipleSimulations, decrementUserCredits, verifyUserEligibility } from './services/firebase';
import { User } from 'firebase/auth';

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
import EmailVerificationScreen from './components/EmailVerificationScreen';
import OnboardingScreen from './components/OnboardingScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import SetupScreen from './components/SetupScreen';
import CallScreen from './components/CallScreen';
import FeedbackScreen from './components/FeedbackScreen';
import ProfileScreen from './components/ProfileScreen';
import UpgradeModal from './components/UpgradeModal';
import { LoadingIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentAudioDeviceId, setCurrentAudioDeviceId] = useState<string | undefined>(undefined);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [currentCallRecordingUrl, setCurrentCallRecordingUrl] = useState<string | null>(null);
  const [deletingState, setDeletingState] = useState<{ recordIds: string[], scenarioId: string | null }>({ recordIds: [], scenarioId: null });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);


  const handleStartApp = useCallback(() => {
    setView('app');
  }, []);

  const handleLoginSuccess = useCallback(async (firebaseUser: User) => {
    try {
      let userProfileData = await getUserProfile(firebaseUser.uid);

      // Implement polling for userProfileData to ensure it's available
      if (!userProfileData) {
        const pollForProfile = async (retries = 10, delay = 500): Promise<Omit<UserProfile, 'callHistory'> | null> => {
          for (let i = 0; i < retries; i++) {
            const profile = await getUserProfile(firebaseUser.uid);
            if (profile) return profile;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          return null;
        };
        userProfileData = await pollForProfile();
      }

      if (!userProfileData) {
        console.error("User profile not found after login/onboarding success, even after polling. Creating a default profile.");
        // Create a default profile if it still doesn't exist (e.g., existing Firebase Auth user logging in for the first time).
        await updateUserProfile(firebaseUser.uid, {
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          // Default values for savedScenarios, subscriptionStatus, freeCredits, createdAt are handled by updateUserProfile
        });
        // Re-fetch the newly created profile
        userProfileData = await getUserProfile(firebaseUser.uid);

        if (!userProfileData) {
          console.error("Failed to create and retrieve default user profile.");
          alert("There was a critical problem setting up your account. Please try logging in again.");
          await signOut(auth);
          return;
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

    } catch (error) {
      console.error("Error during login success handling:", error);
      alert("An error occurred during login. Please try again.");
      await signOut(auth);
    }
  }, []);

  const handleOnboardingComplete = useCallback(async (firebaseUser: User) => {
    await handleLoginSuccess(firebaseUser);
  }, [handleLoginSuccess]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      try {
        if (firebaseUser) {
          if (!firebaseUser.emailVerified) {
            setVerificationEmail(firebaseUser.email!);
            setAppState(AppState.EMAIL_VERIFICATION);
            setView('app');
            return;
          }
          const userProfileData = await getUserProfile(firebaseUser.uid);

          if (!userProfileData || !firebaseUser.displayName) {
            setAppState(AppState.ONBOARDING);
            setView('app');
            return;
          }

          await handleLoginSuccess(firebaseUser);

        } else {
          setUser(null);
          setAppState(AppState.LOGIN);
        }
      } catch (error) {
        console.error("Failed to process auth state change:", error);
        setUser(null);
        setAppState(AppState.LOGIN);
        setView('landing');
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [handleLoginSuccess]);


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

  const handleStartCall = useCallback(async (scenario: Scenario, audioDeviceId?: string) => {
    if (!user) return;

    try {
      await verifyUserEligibility(user.id);
      setCurrentScenario(scenario);
      setCurrentAudioDeviceId(audioDeviceId);
      setAppState(AppState.IN_CALL);
    } catch (error: any) {
      if (error.message === "Insufficient credits") {
        setShowUpgradeModal(true);
      } else {
        console.error("Error starting call:", error);
        alert("Failed to start call. Please try again.");
      }
    }
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
      // Clean the transcript to ensure it's serializable
      const cleanedTranscript = transcript.map(({ speaker, text }) => ({ speaker, text }));

      const feedback = await generateFeedback(currentScenario, cleanedTranscript);
      setCurrentFeedback(feedback);

      const newRecordForDb = {
        scenario: currentScenario,
        transcript: cleanedTranscript, // Use the cleaned transcript
        feedback,
        callRecordingUrl: audioUrl,
      };
      const newRecordId = await saveSimulation(user.id, newRecordForDb);

      // Decrement credits logic is now handled in saveSimulation on the backend
      // We just need to update the local user state to reflect the change if they are free
      if (user.subscriptionStatus === 'free') {
        setUser(prevUser => prevUser ? { ...prevUser, freeCredits: Math.max(0, (prevUser.freeCredits || 0) - 3.3) } : null);
      }

      // Optimistically update local state to show the new record immediately
      const newRecordForState: CallRecord = {
        id: newRecordId, // Use the real ID from Firestore
        date: new Date().toLocaleString(),
        ...newRecordForDb,
      };

      setUser(prevUser => prevUser ? { ...prevUser, callHistory: [newRecordForState, ...prevUser.callHistory] } : null);
      setAppState(AppState.FEEDBACK);
    } catch (error) {
      console.error("Failed to generate feedback or save simulation:", error);
      alert("There was an error processing your call. Please try again.");
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

  const handleGoToLogin = () => {
    setAppState(AppState.LOGIN);
  };

  // Main Render Logic
  const renderContent = () => {
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

    // If we are in the 'app' view or a user is logged in, render the app content
    switch (appState) {
      case AppState.LOGIN:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
      case AppState.EMAIL_VERIFICATION:
        return <EmailVerificationScreen email={verificationEmail} onGoToLogin={handleGoToLogin} />;
      case AppState.ONBOARDING:
        return <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} />;

      // All states below require a user object.
      case AppState.SUBSCRIPTION:
        if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
        return <SubscriptionScreen user={user} onSubscriptionSuccess={handleSubscriptionSuccess} />;
      case AppState.SETUP:
        if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
        return <SetupScreen user={user} onStartCall={handleStartCall} onViewHistory={handleViewHistory} onLogout={handleLogout} onSaveScenario={handleSaveScenario} onDeleteScenario={handleDeleteScenario} deletingScenarioId={deletingState.scenarioId} />;
      case AppState.IN_CALL:
        if (!user || !currentScenario) return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
        return <CallScreen scenario={currentScenario} onEndCall={handleEndCall} onBack={handleBackToSetup} audioDeviceId={currentAudioDeviceId} />;
      case AppState.GENERATING_FEEDBACK:
        return (
          <div className="flex flex-col h-screen w-screen items-center justify-center bg-background text-center">
            <LoadingIcon className="w-12 h-12 text-primary" />
            <h1 className="text-2xl font-semibold mt-4 text-text-primary font-heading">Analyzing your call...</h1>
            <p className="text-text-secondary mt-2">Your feedback is being generated by our AI coach.</p>
          </div>
        );
      case AppState.FEEDBACK:
        if (!user || !currentFeedback) return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
        return <FeedbackScreen feedback={currentFeedback} onNewCall={handleNewCall} onViewHistory={handleViewHistory} callRecordingUrl={currentCallRecordingUrl} />;
      case AppState.PROFILE:
        if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
        return <ProfileScreen user={user} onBack={handleBackToSetup} onLogout={handleLogout} onStartCall={handleStartCall} onDeleteCallRecord={handleDeleteCallRecord} onDeleteMultipleCallRecords={handleDeleteMultipleCallRecords} deletingRecordIds={deletingState.recordIds} onUpdateUserProfile={updateUserProfile} />;
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} onVerificationEmailSent={setVerificationEmail} setAppState={setAppState} />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default App;