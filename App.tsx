import React, { useState, useCallback, useRef } from 'react';
import { Model, ComponentModel } from './types';
import { generateModelFromText } from './services/geminiService';
import Navbar from './components/Navbar';
import IdeaInputPanel from './components/IdeaInputPanel';
import CanvasPanel from './components/CanvasPanel';
import ActionBar from './components/ActionBar';
import ChatModal from './components/ChatModal';
import { toPng } from 'html-to-image';

const App: React.FC = () => {
  const [idea, setIdea] = useState<string>('');
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isExplainMode, setIsExplainMode] = useState<boolean>(true);
  const [isExploring, setIsExploring] = useState<boolean>(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (newIdea: string) => {
    if (!newIdea.trim()) {
      setError("Please enter an idea.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Kicking off the AI...');
    setError(null);
    setModel(null);
    setIdea(newIdea);
    setIsExploring(false);
    setSelectedComponentId(null);

    try {
      const generatedModel = await generateModelFromText(newIdea, (message) => {
        setLoadingMessage(message);
      });
      setModel(generatedModel);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleExport = useCallback(() => {
    if (canvasRef.current === null) {
      return;
    }

    toPng(canvasRef.current.querySelector('svg'), { cacheBust: true, backgroundColor: '#f8fafc' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'innodraw-model.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to export image.");
      });
  }, []);
  
  const handleToggleExplore = () => {
    setIsExploring(prev => !prev);
    setSelectedComponentId(null); // Reset selection when toggling mode
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-slate-800">
      <Navbar />
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        <IdeaInputPanel onGenerate={handleGenerate} isLoading={isLoading} loadingMessage={loadingMessage} />
        <div className="flex-grow flex flex-col gap-4">
          <CanvasPanel
            ref={canvasRef}
            model={model}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            error={error}
            isExplainMode={isExplainMode}
            isExploring={isExploring}
            selectedComponentId={selectedComponentId}
            onComponentClick={setSelectedComponentId}
          />
          <ActionBar
            isModelLoaded={!!model}
            isExplainMode={isExplainMode}
            onToggleExplain={() => setIsExplainMode(prev => !prev)}
            isExploring={isExploring}
            onToggleExplore={handleToggleExplore}
            onAskAI={() => setIsChatOpen(true)}
            onExport={handleExport}
          />
        </div>
      </main>
      {isChatOpen && (
        <ChatModal 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          ideaContext={idea}
          modelContext={model}
        />
      )}
    </div>
  );
};

export default App;