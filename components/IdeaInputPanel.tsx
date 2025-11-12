import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface IdeaInputPanelProps {
  onGenerate: (idea: string) => void;
  isLoading: boolean;
  loadingMessage: string;
}

const IdeaInputPanel: React.FC<IdeaInputPanelProps> = ({ onGenerate, isLoading, loadingMessage }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(idea);
  };

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4 h-fit md:h-[calc(100vh-6rem)]">
      <h2 className="text-xl font-bold text-slate-800">Describe Your Idea</h2>
      <p className="text-sm text-slate-500">
        Enter a concept, and our AI will generate a visual model with images for you. Try "a simple water cycle" or "a basic electric circuit".
      </p>
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g., A car's braking system with a pedal, master cylinder, and brake pads..."
          className="w-full flex-grow p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-200 resize-none text-sm"
          rows={10}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full flex items-center justify-center bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {loadingMessage || 'Generating...'}
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Model
            </>
          )}
        </button>
      </form>
    </aside>
  );
};

export default IdeaInputPanel;