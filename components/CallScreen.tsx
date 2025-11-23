import React, { useEffect, useRef, useState } from 'react';
import { Scenario, TranscriptMessage } from '../types';
import useLiveConversation from '../hooks/useLiveConversation';
import { StopIcon, UserIcon, RobotIcon } from './icons/Icons';
import AudioVisualizer from './AudioVisualizer';

interface CallScreenProps {
  scenario: Scenario;
  onEndCall: (transcript: TranscriptMessage[], audioUrl: string | null) => void;
  onBack: () => void;
  audioDeviceId: string | undefined;
}

const getSimulationSystemInstruction = (scenario: Scenario): string => {
    return `You are taking on the role of a potential client in a sales call simulation.
    - Your Role: ${scenario.clientRole}
    - Your Persona: ${scenario.clientPersona}
    - Your Industry: ${scenario.industry}
    - The consultant you are talking to is a ${scenario.consultantRole}. They contacted you via ${scenario.leadSource}.
    - Your Objection Style: ${scenario.objectionStyle}.
    
    RULES:
    1. Respond in a realistic, natural, and unscripted way.
    2. Express confusion, resistance, objections, interest, and emotional cues based on context.
    3. Strictly stay in character during the simulated call. Do not reveal you are an AI.
    4. The user is responsible for leading the conversation. Never guide the call. Challenge the user with real objections, vague answers, or questions about ROI, pricing, results, etc.
    5. Keep your responses relatively concise to allow for a back-and-forth conversation.
    6. If the user says "End call", respond with a brief closing statement like "Okay, talk to you later." and then stop talking.
    `;
};

const CallScreen: React.FC<CallScreenProps> = ({ scenario, onEndCall, onBack, audioDeviceId }) => {
  const systemInstruction = getSimulationSystemInstruction(scenario);
  const { transcript, connectionState, mediaStream, startSession, endSession, stopRecordingAndGetUrl, error } = useLiveConversation({ systemInstruction, isRecordingEnabled: true, audioDeviceId });
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  // Fix: Replaced `NodeJS.Timeout` with `ReturnType<typeof setInterval>` for browser compatibility.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startSession();
    return () => {
      endSession();
    };
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [scenario]);

  useEffect(() => {
    if (connectionState === 'connected') {
      setElapsedTime(0); // Reset timer on new connection
      timerRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [connectionState]);


  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleEndCall = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const audioUrl = await stopRecordingAndGetUrl();
    const finalTranscript = transcript.filter(t => !t.isPartial);
    onEndCall(finalTranscript, audioUrl);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const getStatusIndicator = () => {
    switch (connectionState) {
      case 'connecting':
        return <div className="text-feedback-constructive">Connecting...</div>;
      case 'connected':
        return (
          <div className="flex items-center gap-4">
            <div className="text-feedback-positive flex items-center gap-2">
              <div className="w-3 h-3 bg-feedback-positive rounded-full animate-pulse"></div>
              Live
            </div>
            <div className="font-mono text-text-secondary">{formatTime(elapsedTime)}</div>
          </div>
        );
      case 'closed':
        return <div className="text-red-500">Call Ended</div>;
      case 'error':
        return <div className="text-red-500">Error</div>;
      default:
        return <div className="text-text-secondary">Idle</div>;
    }
  };
  
  if (connectionState === 'error') {
    return (
        <div className="flex flex-col h-screen bg-background text-text-primary p-4 md:p-6 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold font-heading text-red-600 mb-4">Call Failed to Start</h1>
            <p className="text-text-secondary mb-8 max-w-md">{error || "An unknown error occurred."}</p>
            <div className="flex gap-4">
                 <button 
                    onClick={startSession}
                    className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                    Try Again
                </button>
                <button 
                    onClick={onBack}
                    className="bg-panel hover:bg-background text-text-primary border border-border font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                    Back to Setup
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-text-primary p-4 md:p-6">
      <header className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold font-heading">Sales Call Simulation</h1>
          <p className="text-sm text-text-secondary">Client: {scenario.clientPersona} {scenario.clientRole} in {scenario.industry}</p>
        </div>
        <div className="text-lg font-semibold">
          {getStatusIndicator()}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto my-4 pr-2 space-y-6 font-mono bg-panel p-4 rounded-lg border border-border">
        {transcript.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'user' ? 'justify-end' : ''}`}>
            {msg.speaker === 'ai' && (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <RobotIcon className="w-5 h-5 text-text-secondary" />
                </div>
                <div className="flex flex-col items-start max-w-xl">
                    <span className="text-xs text-text-secondary mb-1">Client</span>
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

      <footer className="flex flex-col items-center justify-center pt-4 border-t border-border">
        <div className="flex items-center space-x-6 h-16">
          <AudioVisualizer mediaStream={mediaStream} isConnected={connectionState === 'connected'} />
          <button 
            onClick={handleEndCall}
            className="flex items-center gap-2 bg-panel hover:bg-background text-red-600 font-semibold py-3 px-6 rounded-full transition duration-300 border border-red-500/50 hover:border-red-500"
          >
            <StopIcon className="w-6 h-6" />
            End Call
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-4">Say "End call" or click the button to finish the simulation and get feedback.</p>
      </footer>
    </div>
  );
};

export default CallScreen;
