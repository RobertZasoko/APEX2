import React from 'react';

const ScreenshotFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-panel border border-border rounded-lg shadow-2xl w-full aspect-[4/3] flex flex-col p-1 md:p-2 overflow-hidden relative text-xs sm:text-sm">
    <div className="flex-shrink-0 flex items-center gap-1.5 p-2 border-b border-border">
      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
    </div>
    <div className="flex-grow bg-background p-4 overflow-hidden">
        {children}
    </div>
  </div>
);

export const SetupScreenshot: React.FC = () => (
  <ScreenshotFrame>
     <div className="w-full h-full flex flex-col bg-background text-xs">
        <header className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-text-primary font-heading">AI Sales Call Simulator</h1>
            <p className="text-text-secondary text-xs">Welcome, Jane! Select or create a scenario to begin.</p>
        </header>
        <div className="flex-grow grid grid-cols-2 gap-4 mt-4 overflow-hidden">
            <div className="bg-background/50 p-3 rounded-lg border border-border flex flex-col">
                <h2 className="text-base font-bold font-heading text-text-primary mb-2">Scenario Library</h2>
                <div className="space-y-2 flex-1 overflow-hidden">
                    <div className="w-full text-left p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
                        <p className="font-semibold text-xs">Tech Startup CEO (Budget)</p>
                        <p className="text-[10px] text-primary/80">Skeptical CEO in SaaS</p>
                    </div>
                    <div className="w-full text-left p-2 rounded-md bg-panel">
                        <p className="font-semibold text-xs">Manufacturing Manager</p>
                        <p className="text-[10px] text-text-secondary">Friendly Manager in Manufacturing</p>
                    </div>
                     <div className="w-full text-left p-2 rounded-md bg-panel">
                        <p className="font-semibold text-xs">Marketing Director (Needs ROI)</p>
                        <p className="text-[10px] text-text-secondary">Rushed Director in eCommerce</p>
                    </div>
                </div>
            </div>
            <div className="space-y-3 flex flex-col">
                <h2 className="text-base font-bold font-heading text-text-primary">Scenario Details</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] font-medium text-text-secondary">Your Role</label>
                        <div className="mt-1 w-full bg-panel border border-border rounded-md py-1.5 px-2 text-text-primary/90 text-xs">Cloud Solutions Architect</div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-text-secondary">Lead Source</label>
                        <div className="mt-1 w-full bg-panel border border-border rounded-md py-1.5 px-2 text-text-primary/90 text-xs">Referral</div>
                    </div>
                     <div>
                        <label className="block text-[11px] font-medium text-text-secondary">Client Role</label>
                        <div className="mt-1 w-full bg-panel border border-border rounded-md py-1.5 px-2 text-text-primary/90 text-xs">CEO</div>
                    </div>
                     <div>
                        <label className="block text-[11px] font-medium text-text-secondary">Client Persona</label>
                        <div className="mt-1 w-full bg-panel border border-border rounded-md py-1.5 px-2 text-text-primary/90 text-xs">Skeptical</div>
                    </div>
                </div>
                <div className="flex-grow" />
                <button className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg text-sm">
                    Start Call
                </button>
            </div>
        </div>
    </div>
  </ScreenshotFrame>
);

export const FeedbackScreenshot: React.FC = () => (
    <ScreenshotFrame>
         <div className="w-full h-full flex flex-col items-center bg-background text-xs">
            <h1 className="text-xl font-semibold text-center text-text-primary font-heading">Call Feedback</h1>
            <div className="text-center my-2">
                <p className="text-sm text-text-secondary">Overall Score</p>
                <p className="text-6xl font-bold text-primary">8<span className="text-2xl text-text-secondary">/10</span></p>
            </div>
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
               <div className="bg-panel p-3 rounded-lg border border-border border-l-4 border-feedback-positive">
                  <h3 className="text-sm font-semibold text-feedback-positive font-heading">Strengths</h3>
                  <ul className="list-disc list-inside space-y-1 text-text-primary text-xs mt-1">
                    <li>Great rapport building at the start.</li>
                    <li>Clear value proposition.</li>
                  </ul>
               </div>
               <div className="bg-panel p-3 rounded-lg border border-border border-l-4 border-feedback-constructive">
                  <h3 className="text-sm font-semibold text-feedback-constructive font-heading">Improvements</h3>
                  <ul className="list-disc list-inside space-y-1 text-text-primary text-xs mt-1">
                    <li>Ask more open-ended discovery questions.</li>
                    <li>"You mentioned X, can you elaborate?"</li>
                  </ul>
               </div>
            </div>
         </div>
    </ScreenshotFrame>
);