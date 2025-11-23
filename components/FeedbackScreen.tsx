
import React, { useState } from 'react';
import { Feedback, FeedbackItem } from '../types';
import useAudioPlayer from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';
import { PlayIcon, StopIcon, LoadingIcon, HistoryIcon, RobotIcon } from './icons/Icons';
import FeedbackDetails from './FeedbackDetails';
import CoachingSession from './CoachingSession';

interface FeedbackScreenProps {
  feedback: Feedback;
  onNewCall: () => void;
  onViewHistory: () => void;
  callRecordingUrl: string | null;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ feedback, onNewCall, onViewHistory, callRecordingUrl }) => {
  const { playAudio, stopAudio, isPlaying, isLoading } = useAudioPlayer();
  const [isCoaching, setIsCoaching] = useState(false);

  const handlePlayFeedback = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const formatStructuredItems = (items: FeedbackItem[]) => {
      return items.map(item => {
        let text = item.point;
        if (item.details && item.details.length > 0) {
          text += '. ' + item.details.join('. ');
        }
        return text;
      }).join('. ');
    };

    const feedbackText = `
      Here is your feedback.
      Your overall score is ${feedback.score} out of 10.
      Let's start with your strengths: ${feedback.strengths.join('. ')}.
      Now for areas of improvement: ${formatStructuredItems(feedback.improvements)}.
      Here are some coaching tips: ${formatStructuredItems(feedback.coachingTips)}.
      Finally, some practice questions for you: ${feedback.practiceQuestions.join('. ')}.
    `;
    try {
      const audioData = await generateSpeech(feedbackText);
      playAudio(audioData);
    } catch (error) {
      console.error("Failed to generate and play feedback audio:", error);
      alert(`Could not play audio feedback. This might be due to a missing API key or a network issue. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl w-full mx-auto my-8">
        <div className="bg-panel p-8 rounded-lg shadow-sm border border-border">
          <h1 className="text-3xl font-semibold text-center text-text-primary mb-4 font-heading">Call Feedback</h1>
          
          <FeedbackDetails feedback={feedback} callRecordingUrl={callRecordingUrl} />
          
          {isCoaching ? (
            <CoachingSession feedback={feedback} onEnd={() => setIsCoaching(false)} />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 mt-8">
              <button
                onClick={() => setIsCoaching(true)}
                className="w-full max-w-sm flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                <RobotIcon className="w-6 h-6" />
                Discuss with AI Coach
              </button>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={onNewCall}
                  className="bg-panel hover:bg-background text-text-primary border border-border font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  New Call
                </button>
                <button
                    onClick={handlePlayFeedback}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-panel hover:bg-background text-text-primary border border-border font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                >
                    {isLoading ? <LoadingIcon className="w-5 h-5" /> : isPlaying ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    {isLoading ? 'Loading' : isPlaying ? 'Stop' : 'Listen'}
                </button>
                 <button
                  onClick={onViewHistory}
                  className="flex items-center gap-2 bg-panel hover:bg-background text-text-primary border border-border font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  <HistoryIcon className="w-5 h-5" />
                  History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackScreen;
