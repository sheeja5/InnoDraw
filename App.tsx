import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Model, Project } from './types';
import { generateModelFromText } from './services/geminiService';
import { getProjects, saveProject, deleteProject } from './services/projectService';
import Navbar from './components/Navbar';
import IdeaInputPanel from './components/IdeaInputPanel';
import CanvasPanel from './components/CanvasPanel';
import ActionBar from './components/ActionBar';
import ChatModal from './components/ChatModal';
import HomePage from './components/HomePage';
import { toPng } from 'html-to-image';

type Page = 'home' | 'create';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

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

  const loadProjects = useCallback(async () => {
    try {
      const projs = await getProjects();
      setProjects(projs);
    } catch (err: any) {
      setError(err.message || 'Could not load projects.');
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const resetWorkspace = () => {
    setIdea('');
    setModel(null);
    setCurrentProjectId(null);
    setError(null);
    setIsExploring(false);
    setSelectedComponentId(null);
    setIsExplainMode(true);
  };

  const handleNavigate = (page: Page) => {
    if (page === 'create' && currentPage === 'home') {
      resetWorkspace();
    }
    setCurrentPage(page);
  };

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
    setCurrentProjectId(null); // It's a new model until saved
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
  
  const handleSaveProject = async () => {
    if (!model || !idea) return;
    
    const newProject: Project = {
      id: currentProjectId || Date.now().toString(),
      name: idea.substring(0, 50) + (idea.length > 50 ? '...' : ''),
      idea: idea,
      model: model,
      createdAt: new Date().toISOString(),
    };
    
    try {
      await saveProject(newProject);
      await loadProjects();
      setCurrentProjectId(newProject.id);
      handleNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    }
  };

  const handleLoadProject = (project: Project) => {
    setIdea(project.idea);
    setModel(project.model);
    setCurrentProjectId(project.id);
    setError(null);
    setIsExploring(false);
    setSelectedComponentId(null);
    handleNavigate('create');
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      await loadProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  const handleExport = useCallback(() => {
    if (canvasRef.current === null) return;
    const svgElement = canvasRef.current.querySelector('svg');
    if (!svgElement) return;

    toPng(svgElement, { cacheBust: true, backgroundColor: '#f8fafc' })
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
    setSelectedComponentId(null);
  }

  const renderWorkspace = () => (
    <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
      <IdeaInputPanel
        initialIdea={idea}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
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
          onSaveProject={handleSaveProject}
        />
      </div>
    </main>
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-slate-800">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'home' ? (
        <HomePage 
          projects={projects}
          onLoadProject={handleLoadProject}
          onDeleteProject={handleDeleteProject}
          onCreateNew={() => handleNavigate('create')}
        />
      ) : (
        renderWorkspace()
      )}
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