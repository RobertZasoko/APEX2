import React, { useEffect, useRef } from 'react';
import { Feedback, TranscriptMessage } from '../types';
import useLiveConversation from '../hooks/useLiveConversation';
import { StopIcon, UserIcon, RobotIcon, LoadingIcon } from './icons/Icons';
import AudioVisualizer from './AudioVisualizer';

const getCoachingSystemInstruction = (feedback: Feedback): string => {
    const feedbackSummary = JSON.stringify(feedback, null, 2);
    return `You are a world-class, encouraging, and insightful sales coach. 
    You are speaking with a user who has just completed a sales call simulation.
    Their goal is to understand their performance and improve.
    
    You have been provided with a JSON object containing their feedback from the call. Your task is to discuss this feedback with them.
    
    FEEDBACK DATA:
    ${feedbackSummary}

    RULES:
    1. Adopt a supportive and Socratic coaching style. Ask questions to help the user reflect on their performance.
    2. Use the provided feedback data as the basis for the conversation. You can reference their score, strengths, and areas for improvement.
    3. Do NOT just read the feedback back to them. Instead, use it to start a conversation. For example, "I see you scored an ${feedback.score} out of 10. How do you feel about that score?" or "The feedback mentions your rapport building was a strength. What do you think you did well there?".
    4. Be prepared to elaborate on any of the feedback points if the user asks.
    5. Keep your responses conversational and not overly long.
    6. If the user says "End session" or "Thanks, that's all", respond with a brief closing statement like "You're welcome! Keep up the great work." and then stop talking.
    7. Do not reveal you are an AI. You are their personal sales coach.
    `;
};

interface CoachingSessionProps {
  feedback: Feedback;
  onEnd: () => void;
}

const CoachingSession: React.FC<CoachingSessionProps> = ({ feedback, onEnd }) => {
  const systemInstruction = getCoachingSystemInstruction(feedback);
  const { transcript, connectionState, mediaStream, startSession, endSession, error } = useLiveConversation({ systemInstruction, isRecordingEnabled: false });
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startSession();
    return () => {
      endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleEndCoaching = () => {
    endSession();
    onEnd();
  };

  const getStatusIndicator = () => {
    switch (connectionState) {
      case 'connecting':
        return <div className="text-feedback-constructive flex items-center gap-2"><LoadingIcon className="w-5 h-5" /> Connecting...</div>;
      case 'connected':
        return (
          <div className="text-feedback-positive flex items-center gap-2">
            <div className="w-3 h-3 bg-feedback-positive rounded-full animate-pulse"></div>
            Live Coaching
          </div>
        );
      case 'closed':
        return <div className="text-red-500">Session Ended</div>;
      case 'error':
        return <div className="text-red-500">Error</div>;
      default:
        return <div className="text-text-secondary">Idle</div>;
    }
  };

  if (connectionState === 'error') {
    return (
      <div className="text-center p-4 mt-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Coaching Session Failed</h2>
        <p className="text-text-secondary mb-4">{error || "An unknown error occurred."}</p>
        <button onClick={onEnd} className="bg-panel hover:bg-background text-text-primary border border-border font-semibold py-2 px-4 rounded-lg">
          Back to Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] max-h-[700px] bg-background text-text-primary rounded-lg border border-border mt-6">
      <header className="flex justify-between items-center p-4 border-b border-border">
        <h2 className="text-xl font-semibold font-heading">AI Coaching Session</h2>
        <div className="text-lg font-semibold">
          {getStatusIndicator()}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 font-mono">
        {transcript.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'user' ? 'justify-end' : ''}`}>
            {msg.speaker === 'ai' && (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <RobotIcon className="w-5 h-5 text-text-secondary" />
                </div>
                <div className="flex flex-col items-start max-w-xl">
                    <span className="text-xs text-text-secondary mb-1">AI Coach</span>
                    <div className={`bg-gray-100 p-3 rounded-lg rounded-tl-none ${msg.isPartial ? 'text-text-secondary' : 'text-text-primary'}`}>
                        <p>{msg.text}</p>
                    </div>
                </div>
              </>
            )}
            {msg.speaker === 'user' && (
                <>
                    <div className="flex flex-col items-end max-w-xl">
                        <span className="text-xs text-primary mb-1">You</span>
                        <div className={`bg-primary p-3 rounded-lg rounded-tr-none ${msg.isPartial ? 'text-blue-200' : 'text-white'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-white" />
                    </div>
                </>
            )}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </main>

      <footer className="flex flex-col items-center justify-center p-4 border-t border-border">
        <div className="flex items-center space-x-6 h-16">
          <AudioVisualizer mediaStream={mediaStream} isConnected={connectionState === 'connected'} />
          <button 
            onClick={handleEndCoaching}
            className="flex items-center gap-2 bg-panel hover:bg-background text-red-600 font-semibold py-3 px-6 rounded-full transition duration-300 border border-red-500/50 hover:border-red-500"
          >
            <StopIcon className="w-6 h-6" />
            End Session
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CoachingSession;
