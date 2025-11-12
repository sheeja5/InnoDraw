import React from 'react';
import { InfoIcon } from './icons/InfoIcon';
import { ChatIcon } from './icons/ChatIcon';
import { DownloadIcon } from './icons/DownloadIcon';

// A new icon for the 'Explore' feature
const ExploreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715.932 16.347a.75.75 0 0 0 1.06 1.06L17.25 9.125l2.846.813a.75.75 0 0 0 0-1.5l-2.846-.813-1.06-1.061a.75.75 0 0 0-1.06 0Z" />
  </svg>
);


interface ActionBarProps {
  isModelLoaded: boolean;
  isExplainMode: boolean;
  onToggleExplain: () => void;
  isExploring: boolean;
  onToggleExplore: () => void;
  onAskAI: () => void;
  onExport: () => void;
}

const ActionButton: React.FC<{ onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode; }> = ({ onClick, disabled, active, children }) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";
  const activeClasses = active ? "bg-teal-500 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow";
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${activeClasses}`}>
      {children}
    </button>
  );
};

const ActionBar: React.FC<ActionBarProps> = ({
  isModelLoaded,
  isExplainMode,
  onToggleExplain,
  isExploring,
  onToggleExplore,
  onAskAI,
  onExport,
}) => {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-md p-3 flex items-center justify-center md:justify-end space-x-2 md:space-x-4">
      <ActionButton onClick={onToggleExplain} disabled={!isModelLoaded} active={isExplainMode}>
        <InfoIcon className="w-5 h-5" />
        <span>Explain</span>
      </ActionButton>
      <ActionButton onClick={onToggleExplore} disabled={!isModelLoaded} active={isExploring}>
        <ExploreIcon className="w-5 h-5" />
        <span>Explore</span>
      </ActionButton>
      <ActionButton onClick={onAskAI} disabled={!isModelLoaded}>
        <ChatIcon className="w-5 h-5" />
        <span>Ask AI</span>
      </ActionButton>
      <ActionButton onClick={onExport} disabled={!isModelLoaded}>
        <DownloadIcon className="w-5 h-5" />
        <span>Export</span>
      </ActionButton>
    </div>
  );
};

export default ActionBar;
