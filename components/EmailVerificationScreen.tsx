
import React from 'react';

interface EmailVerificationScreenProps {
    email: string;
    onGoToLogin: () => void;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ email, onGoToLogin }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-panel rounded-lg shadow-lg border border-border text-center">
                <h1 className="text-3xl font-bold text-primary font-heading">Verify Your Email</h1>
                <p className="text-text-secondary">
                    We have sent a verification link to <span className="font-semibold text-text-primary">{email}</span>.
                </p>
                <p className="text-text-secondary">
                    Please check your inbox (and spam folder) and click the link to activate your account.
                </p>
                <button
                    onClick={onGoToLogin}
                    className="w-full px-4 py-2 font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover transition duration-300"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default EmailVerificationScreen;
