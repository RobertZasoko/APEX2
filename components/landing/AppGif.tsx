import React, { useState, useEffect } from 'react';
import { RobotIcon, UserIcon } from '../icons/Icons';

const GifSetupFrame: React.FC = () => (
  <div className="w-full h-full flex flex-col p-4 md:p-6 bg-background rounded-lg text-xs md:text-sm">
    <header className="flex-shrink-0">
      <h1 className="text-lg md:text-2xl font-semibold text-text-primary font-heading">AI Sales Call Simulator</h1>
      <p className="text-text-secondary">Select or create a scenario to begin.</p>
    </header>
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-4 overflow-hidden">
      <div className="bg-background/50 p-2 md:p-4 rounded-lg border border-border flex flex-col">
        <h2 className="text-base md:text-xl font-bold font-heading text-text-primary mb-2">Scenario Library</h2>
        <div className="space-y-2 flex-1 overflow-hidden">
          <div className="w-full text-left p-2 md:p-3 rounded-md bg-primary/10 text-primary">
            <p className="font-semibold">Tech Startup CEO (Budget)</p>
            <p className="text-xs text-primary/80">Skeptical CEO in SaaS</p>
          </div>
          <div className="w-full text-left p-2 md:p-3 rounded-md hover:bg-panel">
            <p className="font-semibold">Manufacturing Manager</p>
            <p className="text-xs text-text-secondary">Friendly Manager in Manufacturing</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 md:space-y-4 flex flex-col">
        <h2 className="text-base md:text-xl font-bold font-heading text-text-primary">Scenario Details</h2>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary">Your Role</label>
            <div className="mt-1 w-full bg-panel border border-border rounded-md py-1 px-2 text-text-primary/70">Cloud Solutions Architect</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary">Client Role</label>
            <div className="mt-1 w-full bg-panel border border-border rounded-md py-1 px-2 text-text-primary/70">CEO</div>
          </div>
        </div>
        <div className="flex-grow" />
        <button className="w-full bg-primary text-white font-semibold py-2 md:py-3 px-4 rounded-lg">
          Start Call
        </button>
      </div>
    </div>
  </div>
);

const GifCallFrame: React.FC = () => (
  <div className="w-full h-full flex flex-col p-4 md:p-6 bg-background rounded-lg text-xs md:text-sm">
    <header className="flex justify-between items-center pb-2 border-b border-border flex-shrink-0">
      <div>
        <h1 className="text-base md:text-xl font-semibold font-heading">Sales Call Simulation</h1>
      </div>
      <div className="text-base font-semibold text-feedback-positive flex items-center gap-2">
        <div className="w-2 h-2 bg-feedback-positive rounded-full animate-pulse"></div>Live
      </div>
    </header>
    <main className="flex-1 overflow-hidden my-2 space-y-4 bg-panel p-2 md:p-4 rounded-lg border border-border">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <RobotIcon className="w-4 h-4 text-text-secondary" />
        </div>
        <div className="bg-gray-100 p-2 rounded-lg rounded-tl-none text-text-primary">
          <p>So, what's this about? I've only got a few minutes.</p>
        </div>
      </div>
      <div className="flex items-start gap-2 justify-end">
        <div className="bg-primary p-2 rounded-lg rounded-tr-none text-white">
          <p>I appreciate your time. I'm calling because I saw...</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 text-white" />
        </div>
      </div>
    </main>
    <footer className="flex flex-col items-center justify-center pt-2 border-t border-border flex-shrink-0">
        <button className="bg-panel text-red-600 font-semibold py-2 px-4 rounded-full border border-red-500/50">
          End Call
        </button>
    </footer>
  </div>
);


const GifFeedbackFrame: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 bg-background rounded-lg text-xs md:text-sm">
    <h1 className="text-xl md:text-3xl font-semibold text-center text-text-primary font-heading">Call Feedback</h1>
    <div className="text-center my-4">
      <p className="text-base text-text-secondary">Overall Score</p>
      <p className="text-5xl md:text-7xl font-bold text-primary">8<span className="text-2xl md:text-3xl text-text-secondary">/10</span></p>
    </div>
    <div className="w-full max-w-md grid grid-cols-2 gap-2 md:gap-4">
       <div className="bg-panel p-2 md:p-4 rounded-lg border border-border border-l-4 border-feedback-positive">
          <h3 className="text-sm md:text-base font-semibold text-feedback-positive font-heading">Strengths</h3>
          <ul className="list-disc list-inside space-y-1 text-text-primary mt-1">
            <li>Good opening</li>
            <li>Rapport building</li>
          </ul>
       </div>
       <div className="bg-panel p-2 md:p-4 rounded-lg border border-border border-l-4 border-feedback-constructive">
          <h3 className="text-sm md:text-base font-semibold text-feedback-constructive font-heading">Improvements</h3>
          <ul className="list-disc list-inside space-y-1 text-text-primary mt-1">
            <li>Ask more questions</li>
            <li>Handle objections</li>
          </ul>
       </div>
    </div>
     <button className="mt-4 bg-primary text-white font-semibold py-2 md:py-3 px-6 rounded-lg">
        Start a New Call
    </button>
  </div>
);


const AppGif: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState<'setup' | 'call' | 'feedback'>('setup');

  useEffect(() => {
    const sequence: ('setup' | 'call' | 'feedback')[] = ['setup', 'call', 'feedback'];
    const currentIndex = sequence.indexOf(currentFrame);
    const nextIndex = (currentIndex + 1) % sequence.length;
    
    const timer = setTimeout(() => {
      setCurrentFrame(sequence[nextIndex]);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentFrame]);

  return (
    <div className="bg-panel border border-border rounded-lg shadow-2xl w-full aspect-video flex items-center justify-center p-1 md:p-2 overflow-hidden relative">
      <div className={`w-full h-full absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${currentFrame === 'setup' ? 'opacity-100' : 'opacity-0'}`}>
        <GifSetupFrame />
      </div>
      <div className={`w-full h-full absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${currentFrame === 'call' ? 'opacity-100' : 'opacity-0'}`}>
        <GifCallFrame />
      </div>
      <div className={`w-full h-full absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${currentFrame === 'feedback' ? 'opacity-100' : 'opacity-0'}`}>
        <GifFeedbackFrame />
      </div>
    </div>
  );
};

export default AppGif;
