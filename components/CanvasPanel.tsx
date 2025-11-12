import React, { useState, forwardRef, useMemo } from 'react';
import { Model, ComponentModel } from '../types';

interface CanvasPanelProps {
  model: Model | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  isExplainMode: boolean;
  isExploring: boolean;
  selectedComponentId: string | null;
  onComponentClick: (id: string | null) => void;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const CanvasPanel = forwardRef<HTMLDivElement, CanvasPanelProps>(({ model, isLoading, loadingMessage, error, isExplainMode, isExploring, selectedComponentId, onComponentClick }, ref) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId || !model) return null;
    return model.components.find(c => c.id === selectedComponentId);
  }, [selectedComponentId, model]);

  const relatedComponentIds = useMemo(() => {
    if (!selectedComponent || !selectedComponent.relationships) return new Set();
    return new Set(selectedComponent.relationships.map(r => r.targetId));
  }, [selectedComponent]);

  const handleMouseOver = (e: React.MouseEvent, component: ComponentModel) => {
    if (!isExplainMode || isExploring || component.type !== 'image') return;
    const bbox = (e.target as SVGElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      content: component.description,
      x: bbox.x + bbox.width / 2,
      y: bbox.y - 10,
    });
  };

  const handleMouseOut = () => {
    setTooltip({ ...tooltip, visible: false });
  };
  
  const handleComponentClick = (component: ComponentModel) => {
    if (!isExploring) return;
    if(selectedComponentId === component.id) {
        onComponentClick(null); // Deselect if clicked again
    } else {
        onComponentClick(component.id);
    }
  };

  const getComponentStyle = (component: ComponentModel) => {
    const baseStyle = { transition: 'opacity 300ms ease-in-out' };
    if (!isExploring) return { ...baseStyle, cursor: isExplainMode && component.type === 'image' ? 'pointer' : 'default', opacity: 1 };
    
    if (!selectedComponentId) {
      return { ...baseStyle, cursor: 'pointer', opacity: 1 };
    }
    
    if (component.id === selectedComponentId) {
      return { ...baseStyle, cursor: 'pointer', opacity: 1 };
    }

    if (relatedComponentIds.has(component.id)) {
      return { ...baseStyle, cursor: 'default', opacity: 0.8 };
    }
    
    return { ...baseStyle, cursor: 'pointer', opacity: 0.3 };
  }

  return (
    <div ref={ref} className="bg-white flex-grow rounded-xl shadow-md p-4 flex items-center justify-center relative overflow-hidden">
      {tooltip.visible && (
        <div
          className="absolute z-30 px-3 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg shadow-sm pointer-events-none"
          style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px`, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.content}
        </div>
      )}
      
      {isExploring && selectedComponent && (
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md p-4 rounded-lg shadow-lg max-w-sm z-20 animate-fade-in">
              <h3 className="font-bold text-lg text-teal-600 mb-2">{selectedComponent.label}</h3>
              <p className="text-sm text-slate-700 mb-3">{selectedComponent.description}</p>
              <h4 className="font-semibold text-sm text-slate-800 mb-1">Connections:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {selectedComponent.relationships && selectedComponent.relationships.length > 0 ? (
                    selectedComponent.relationships.map(rel => {
                      const target = model?.components.find(c => c.id === rel.targetId);
                      return (
                        <li key={rel.targetId}>
                          {rel.description} <strong>{target?.label || 'another component'}</strong>.
                        </li>
                      );
                    })
                  ) : (
                    <li>No direct connections defined.</li>
                  )}
              </ul>
          </div>
      )}

      <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
        {isLoading && <p className="text-slate-500 animate-pulse">{loadingMessage}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!isLoading && !error && !model && (
          <div className="text-center text-slate-400">
            <h3 className="text-lg font-semibold">Welcome to InnoDraw AI</h3>
            <p>Your generated model will appear here.</p>
          </div>
        )}
        {model && (
          <svg width="500" height="500" viewBox="0 0 500 500">
            {model.components.map((c) => {
              const style = getComponentStyle(c);
              const isSelected = selectedComponentId === c.id;
              
              switch (c.type) {
                case 'image':
                  return (
                    <g key={c.id} style={style} onClick={() => handleComponentClick(c)} onMouseOver={(e) => handleMouseOver(e, c)} onMouseOut={handleMouseOut}>
                      {isSelected && (
                        <rect
                          x={(c.x ?? 0) - 4}
                          y={(c.y ?? 0) - 4}
                          width={(c.width ?? 0) + 8}
                          height={(c.height ?? 0) + 8}
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="3"
                          rx="8"
                          ry="8"
                        />
                      )}
                      <image
                        href={c.imageUrl}
                        x={c.x}
                        y={c.y}
                        width={c.width}
                        height={c.height}
                      />
                      <text x={(c.x ?? 0) + (c.width ?? 0) / 2} y={(c.y ?? 0) + (c.height ?? 0) + 15} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="12" className="pointer-events-none font-semibold">
                        {c.label}
                      </text>
                    </g>
                  );
                case 'line':
                    return (
                        <g key={c.id} style={style} onClick={() => handleComponentClick(c)}>
                             <line
                                x1={c.x}
                                y1={c.y}
                                x2={c.x2}
                                y2={c.y2}
                                stroke="#94a3b8"
                                strokeWidth={isSelected ? 4 : 2}
                                strokeDasharray={isSelected ? "4 4" : "none"}
                              />
                        </g>
                    );
                default:
                  return null;
              }
            })}
          </svg>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
});

export default CanvasPanel;