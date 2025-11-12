import React from 'react';
import { Project } from '../types';
import { LogoIcon } from './icons/LogoIcon';

interface HomePageProps {
  projects: Project[];
  onLoadProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onCreateNew: () => void;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const ProjectCard: React.FC<{ project: Project, onLoad: () => void, onDelete: () => void }> = ({ project, onLoad, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div 
        className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between group cursor-pointer hover:shadow-lg hover:border-teal-400 border-2 border-transparent transition-all duration-300"
        onClick={onLoad}
    >
      <div>
        <h3 className="font-bold text-slate-800 truncate group-hover:text-teal-500">{project.name}</h3>
        <p className="text-sm text-slate-500 mt-1">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center justify-end space-x-2 mt-4">
         <button onClick={handleDelete} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors">
            <TrashIcon className="w-5 h-5"/>
        </button>
        <button onClick={onLoad} className="text-sm font-semibold text-teal-500 hover:text-teal-600">
            Open Project
        </button>
      </div>
    </div>
  );
};


const HomePage: React.FC<HomePageProps> = ({ projects, onLoadProject, onDeleteProject, onCreateNew }) => {
  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Projects</h1>
        <button 
            onClick={onCreateNew}
            className="mt-4 sm:mt-0 flex items-center justify-center bg-teal-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map(p => (
            <ProjectCard 
                key={p.id} 
                project={p} 
                onLoad={() => onLoadProject(p)}
                onDelete={() => onDeleteProject(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <LogoIcon className="h-16 w-16 text-slate-300 mx-auto" />
          <h2 className="mt-6 text-2xl font-semibold text-slate-700">Welcome to InnoDraw AI</h2>
          <p className="mt-2 text-slate-500">You don't have any projects yet.</p>
          <p className="mt-1 text-slate-500">Click the button below to start creating!</p>
          <button
            onClick={onCreateNew}
            className="mt-8 flex items-center mx-auto bg-teal-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Your First Project
          </button>
        </div>
      )}
    </main>
  );
};

export default HomePage;
