import React from 'react';
import { WikiPage } from '../../types';

interface WikiHomeProps {
  pages: WikiPage[];
  onNavigate: (slug: string) => void;
  onCreate: () => void;
}

const WikiHome: React.FC<WikiHomeProps> = ({ pages, onNavigate, onCreate }) => {
  const pinnedPages = pages.filter(p => p.category === 'pinned');
  const sessionPages = pages.filter(p => p.category === 'session');
  const otherPages = pages.filter(p => !p.category || p.category === 'other');

  const renderSection = (title: string, sectionPages: WikiPage[]) => {
    if (sectionPages.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-xl font-title text-stone-400 mb-4 border-b border-stone-800 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionPages.map(page => (
            <button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              className="text-left p-4 bg-black/20 hover:bg-black/40 border border-stone-800 hover:border-stone-600 rounded transition-all group"
            >
              <h3 className="font-title text-xl text-stone-300 group-hover:text-red-400 mb-1">{page.title}</h3>
              <p className="text-xs text-stone-600">
                Actualizado por {page.updatedBy}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-900/80 p-6 rounded-lg border border-stone-700 min-h-[600px]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-stone-700 pb-4 gap-4">
        <h2 className="text-3xl font-title text-red-500 text-center sm:text-left">Diario de Aventura</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded border border-red-800/50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span>+</span> Nueva Página
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-xl mb-2">El diario está vacío.</p>
          <p className="text-sm">Sé el primero en registrar las crónicas de vuestra travesía.</p>
        </div>
      ) : (
        <div>
          {renderSection('Entradas Fijas', pinnedPages)}
          {renderSection('Sesiones', sessionPages)}
          {renderSection('Otras Entradas', otherPages)}
        </div>
      )}
    </div>
  );
};

export default WikiHome;
