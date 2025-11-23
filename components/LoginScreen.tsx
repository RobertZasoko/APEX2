import React, { useState } from 'react';
import { GoogleIcon, UserIcon } from './icons/Icons';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/firebase';
import { AuthError, User } from 'firebase/auth';

const LoginScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged in App.tsx will handle the success case
    } catch (err) {
      const authError = err as AuthError;
      // Firebase provides user-friendly error messages, but we can customize if needed.
      if (authError.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (authError.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please sign in or use a different email.');
      } else {
        setError(authError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in App.tsx will handle the success case
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-panel p-8 rounded-lg shadow-sm border border-border">
        <div className="text-center">
            <UserIcon className="mx-auto h-12 w-12 text-text-secondary" />
            <h1 className="text-3xl font-semibold text-text-primary mt-4 font-heading">{isLoginView ? 'Welcome Back' : 'Create an Account'}</h1>
            <p className="text-text-secondary mt-2">Enter your credentials to access your training dashboard.</p>
        </div>
        <form onSubmit={handleEmailPasswordSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border bg-panel text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm rounded-t-md" placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password-for-password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border bg-panel text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm rounded-b-md" placeholder="Password" />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}

          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition duration-300 disabled:bg-primary/50">
              {isLoading ? 'Processing...' : isLoginView ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-panel text-text-secondary">Or continue with</span>
                </div>
            </div>

            <div className="mt-6">
                <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full inline-flex justify-center items-center py-2 px-4 border border-border rounded-md shadow-sm bg-panel text-sm font-medium text-text-primary hover:bg-background transition-colors disabled:opacity-50">
                    <GoogleIcon className="w-5 h-5" />
                    <span className="ml-2">Sign in with Google</span>
                </button>
            </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-medium text-primary hover:text-primary-hover">
                {isLoginView ? 'Sign Up' : 'Sign In'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
