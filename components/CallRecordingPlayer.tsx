import React from 'react';

interface CallRecordingPlayerProps {
  audioUrl: string;
}

const CallRecordingPlayer: React.FC<CallRecordingPlayerProps> = ({ audioUrl }) => {
  return (
    <div className="bg-background p-4 rounded-lg mb-6 border border-border">
      <h3 className="text-lg font-semibold text-primary mb-3 font-heading">Call Recording</h3>
      <div className="flex items-center gap-4">
        <audio controls src={audioUrl} className="w-full h-10">
          Your browser does not support the audio element.
        </audio>
        <a
          href={audioUrl}
          download="sales-call-recording.webm"
          className="flex-shrink-0 bg-panel hover:bg-background text-text-primary font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm border border-border"
          aria-label="Download call recording"
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default CallRecordingPlayer;