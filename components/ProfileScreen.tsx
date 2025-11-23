import React, { useState, useEffect } from 'react';
import { UserProfile, CallRecord, Scenario } from '../types';
import { LogoutIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon, LoadingIcon } from './icons/Icons';
import FeedbackDetails from './FeedbackDetails';

interface ProfileScreenProps {
    user: UserProfile;
    onBack: () => void;
    onLogout: () => void;
    onStartCall: (scenario: Scenario) => void;
    onDeleteCallRecord: (recordId: string) => void;
    onDeleteMultipleCallRecords: (recordIds: string[]) => void;
    deletingRecordIds: string[];
}

const CallHistoryItem: React.FC<{ 
    record: CallRecord; 
    onStartCall: (scenario: Scenario) => void; 
    onDelete: (recordId: string) => void;
    isSelectionMode: boolean;
    isSelected: boolean;
    onToggleSelect: (recordId: string) => void;
    isDeleting: boolean;
}> = ({ record, onStartCall, onDelete, isSelectionMode, isSelected, onToggleSelect, isDeleting }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Collapse items when entering selection mode for a cleaner UI
    useEffect(() => {
        if (isSelectionMode) {
            setIsExpanded(false);
        }
    }, [isSelectionMode]);

    const handleContainerClick = () => {
        if (isDeleting) return;
        if (isSelectionMode) {
            onToggleSelect(record.id);
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (isDeleting) return;
        if (event.key === 'Enter' || event.key === ' ') {
            handleContainerClick();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleContainerClick}
            onKeyDown={handleKeyPress}
            aria-expanded={!isSelectionMode && isExpanded}
            aria-checked={isSelectionMode ? isSelected : undefined}
            className={`bg-panel rounded-lg border ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'} transition-all duration-200 ${isSelectionMode && !isDeleting ? 'cursor-pointer' : ''} ${isDeleting ? 'opacity-60' : ''}`}
        >
            <div className="w-full flex items-center p-4 text-left">
                {isSelectionMode && (
                    <div className="pr-4 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => { e.stopPropagation(); onToggleSelect(record.id); }}
                            onClick={(e) => e.stopPropagation()} // Prevent double-trigger from container click
                            disabled={isDeleting}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            aria-label={`Select call from ${record.date}`}
                        />
                    </div>
                )}
                <div className="flex-1">
                    <p className="font-semibold text-text-primary">Call with {record.scenario.clientPersona} {record.scenario.clientRole}</p>
                    <p className="text-sm text-text-secondary">{record.date}</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-primary">{record.feedback.score}<span className="text-sm text-text-secondary">/10</span></p>
                    {isDeleting ? <LoadingIcon className="w-6 h-6 text-text-secondary" /> : (!isSelectionMode && (
                        isExpanded ? <ChevronUpIcon className="w-6 h-6 text-text-secondary" /> : <ChevronDownIcon className="w-6 h-6 text-text-secondary" />
                    ))}
                </div>
            </div>
            {!isSelectionMode && isExpanded && (
                <div className="p-4 border-t border-border">
                    <FeedbackDetails feedback={record.feedback} callRecordingUrl={record.callRecordingUrl} />
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); onStartCall(record.scenario); }}
                            disabled={isDeleting}
                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                        >
                            Retry This Scenario
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                            disabled={isDeleting}
                            className="p-2 rounded-full text-text-secondary hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                            aria-label="Delete this call record"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onLogout, onStartCall, onDeleteCallRecord, onDeleteMultipleCallRecords, deletingRecordIds }) => {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
    const isCurrentlyDeleting = deletingRecordIds.length > 0;

    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedRecordIds(new Set()); // Reset selection when toggling mode
    };

    const handleToggleRecordSelection = (recordId: string) => {
        setSelectedRecordIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(recordId)) {
                newSet.delete(recordId);
            } else {
                newSet.add(recordId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedRecordIds.size === user.callHistory.length) {
            setSelectedRecordIds(new Set()); // Deselect all
        } else {
            const allIds = new Set(user.callHistory.map(r => r.id));
            setSelectedRecordIds(allIds);
        }
    };

    const handleDeleteSelected = () => {
        onDeleteMultipleCallRecords(Array.from(selectedRecordIds));
        // Exit selection mode after deletion
        setIsSelectionMode(false);
        setSelectedRecordIds(new Set());
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-text-primary font-heading">{user.name}'s Profile</h1>
                        <p className="text-text-secondary">Review your past performance and track your improvement.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isSelectionMode ? (
                            <>
                                <button 
                                    onClick={handleDeleteSelected}
                                    disabled={selectedRecordIds.size === 0 || isCurrentlyDeleting}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:bg-red-400 disabled:cursor-not-allowed"
                                >
                                    {isCurrentlyDeleting ? (
                                        <>
                                            <LoadingIcon className="w-5 h-5" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <TrashIcon className="w-5 h-5" />
                                            Delete ({selectedRecordIds.size})
                                        </>
                                    )}
                                </button>
                                <button onClick={handleToggleSelectionMode} className="bg-panel hover:bg-background text-text-primary font-semibold py-2 px-4 rounded-lg border border-border transition duration-300">
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onBack} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                                    New Call
                                </button>
                                {user.callHistory.length > 0 && (
                                    <button onClick={handleToggleSelectionMode} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                        Select
                                    </button>
                                )}
                                <button onClick={onLogout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    <LogoutIcon className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <main className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-text-primary border-b border-border pb-2 font-heading">Call History</h2>
                        {isSelectionMode && user.callHistory.length > 0 && (
                            <div className="flex items-center">
                                <label htmlFor="selectAll" className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                                    <input 
                                        type="checkbox" 
                                        id="selectAll"
                                        checked={selectedRecordIds.size === user.callHistory.length && user.callHistory.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    Select All
                                </label>
                            </div>
                        )}
                    </div>
                    
                    {user.callHistory.length > 0 ? (
                        user.callHistory.map(record => (
                            <CallHistoryItem 
                                key={record.id} 
                                record={record} 
                                onStartCall={onStartCall} 
                                onDelete={onDeleteCallRecord}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedRecordIds.has(record.id)}
                                onToggleSelect={handleToggleRecordSelection}
                                isDeleting={deletingRecordIds.includes(record.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-panel rounded-lg border border-border">
                            <p className="text-text-secondary">You haven't completed any calls yet.</p>
                            <button onClick={onBack} className="mt-4 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                                Start Your First Call
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProfileScreen;