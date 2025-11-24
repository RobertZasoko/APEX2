import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from '../services/firebase';
import { User, getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { AppState } from '../types';
import { GoogleIcon, LoadingIcon } from './icons/Icons';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onVerificationEmailSent: (email: string) => void;
  setAppState: (state: AppState) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onVerificationEmailSent, setAppState }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess(result.user);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let userCredential;
      if (isLoginView) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            await sendEmailVerification(userCredential.user);
            onVerificationEmailSent(userCredential.user.email!);
            setAppState(AppState.EMAIL_VERIFICATION);
            return;
        }
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        onVerificationEmailSent(userCredential.user.email!);
        setAppState(AppState.EMAIL_VERIFICATION);
        return; // Don't call onLoginSuccess yet
      }
      onLoginSuccess(userCredential.user);
    } catch (error: any) {
        console.error("Email/Password Auth Error:", error);
        switch (error.code) {
            case 'auth/user-not-found':
                setError("No account found with this email. Please sign up.");
                break;
            case 'auth/wrong-password':
                setError("Password incorrect, please try again.");
                break;
            case 'auth/email-already-in-use':
                setError("This email is already registered. Please log in or use a different email.");
                break;
            default:
                setError("An unexpected error occurred. Please try again.");
                break;
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResetMessage('');
    const authInstance = getAuth();
    try {
      await sendPasswordResetEmail(authInstance, resetEmail);
      setResetMessage(`Password reset email sent to ${resetEmail}. Check your inbox.`);
      setIsPasswordReset(false);
      setResetEmail('');
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      setError("Failed to send password reset email. Please ensure the email is correct and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary">
        <div className="w-full max-w-md p-8 space-y-6 bg-panel rounded-lg shadow-lg border border-border">
          <h2 className="text-2xl font-bold text-center text-text-primary font-heading">Reset Password</h2>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 text-text-primary bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            {isLoading ? (
                <div className="flex justify-center items-center w-full h-10">
                  <LoadingIcon className="w-8 h-8" />
                </div>
            ) : (
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover">
                  Send Reset Email
                </button>
            )}
          </form>
          {resetMessage && <p className="text-center text-green-500">{resetMessage}</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          <p className="text-center">
            <button onClick={() => setIsPasswordReset(false)} className="text-sm text-primary hover:underline">Back to Login</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary">
      <div className="w-full max-w-md p-8 space-y-6 bg-panel rounded-lg shadow-lg border border-border">
        <h2 className="text-3xl font-bold text-center text-text-primary font-heading">{isLoginView ? 'Log In' : 'Sign Up'}</h2>
        <p className="text-center text-text-secondary">The #1 AI Role-Play Platform</p>

        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}
        
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 text-text-primary bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2 text-text-primary bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          {isLoading ? (
              <div className="flex justify-center items-center w-full h-10">
                <LoadingIcon className="w-8 h-8" />
              </div>
          ) : (
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover">
              {isLoginView ? 'Log In' : 'Sign Up'}
            </button>
          )}
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-panel text-text-secondary">Or continue with</span>
          </div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-text-primary bg-background hover:bg-panel-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover disabled:opacity-50">
          <GoogleIcon className="w-5 h-5 mr-2" />
          Google
        </button>

        <p className="text-center">
          {isLoginView ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => { setIsLoginView(false); setError(null); }} className="font-medium text-primary hover:underline">Sign up</button>
              {' | '}
              <button onClick={() => { setIsPasswordReset(true); setError(null); }} className="text-sm text-primary hover:underline">Forgot Password?</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setIsLoginView(true); setError(null); }} className="font-medium text-primary hover:underline">Log in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
