import React, { useState } from 'react';
import { auth, updateUserProfile } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { LoadingIcon } from './icons/Icons';

const OnboardingScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setError("Please enter a name.");
            return;
        }
        const user = auth.currentUser;
        if (!user) {
            setError("Not authenticated. Please try logging in again.");
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const finalUsername = username.trim();
            // Update both the Firestore document and the Auth profile
            await updateUserProfile(user.uid, { name: finalUsername });
            await updateProfile(user, { displayName: finalUsername });
            // onAuthStateChanged in App.tsx will now pick up the changes and proceed.
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError("Could not save your name. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-panel p-8 rounded-lg shadow-sm border border-border text-center">
                <h1 className="text-3xl font-semibold text-text-primary font-heading">Welcome to Apex AI!</h1>
                <p className="text-text-secondary mt-2">Let's get your profile set up. What should we call you?</p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="username" className="sr-only">Your Name</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="name"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border bg-panel text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Enter your name"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 pt-2">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition duration-300 disabled:bg-primary/50"
                        >
                            {isLoading ? <LoadingIcon className="w-5 h-5" /> : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardingScreen;
