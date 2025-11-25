import React from 'react';
import { CloseIcon } from './icons/Icons';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-panel border border-border rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">💎</span>
                    </div>

                    <h2 className="text-2xl font-bold text-text-primary font-heading">
                        You're out of credits!
                    </h2>

                    <p className="text-text-secondary">
                        Upgrade to Pro for unlimited simulations and unlock your full potential.
                    </p>

                    <div className="pt-4 space-y-3">
                        <a
                            href="#pricing" // Assuming pricing section is on landing page or separate route
                            onClick={(e) => {
                                e.preventDefault();
                                // You might want to handle navigation or open a pricing modal here
                                // For now, we'll just close and maybe redirect if needed
                                window.location.href = '/#pricing';
                            }}
                            className="block w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition duration-300 text-center"
                        >
                            Upgrade to Pro
                        </a>

                        <button
                            onClick={onClose}
                            className="block w-full bg-transparent hover:bg-white/5 text-text-secondary font-semibold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
