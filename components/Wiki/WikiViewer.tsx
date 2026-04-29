import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WikiPage, PlayerId } from '../../types';

interface WikiViewerProps {
  page: WikiPage;
  onNavigate: (slug: string) => void;
  onEdit: () => void;
  onViewHistory: () => void;
  onDelete: () => void;
  currentPlayerId: PlayerId;
}

const WikiViewer: React.FC<WikiViewerProps> = ({ page, onNavigate, onEdit, onViewHistory, onDelete, currentPlayerId }) => {
  const canDelete = page.createdBy === currentPlayerId;
  const [copied, setCopied] = useState(false);

  const handleCopySlug = () => {
    navigator.clipboard.writeText(page.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-stone-900/80 p-6 rounded-lg border border-stone-700 min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-stone-700 pb-4 gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-title text-red-500 mb-1 break-words">{page.title}</h2>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="text-xs font-mono text-amber-700/70 select-all break-all">slug: {page.id}</p>
            <button 
              onClick={handleCopySlug}
              className="text-stone-600 hover:text-stone-400 transition-colors flex-shrink-0"
              title="Copiar slug"
            >
              {copied ? (
                <span className="text-green-500 text-[10px]">¡Copiado!</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-stone-500">
            Creado por <span className="text-stone-400">{page.createdBy || 'Desconocido'}</span> • 
            Última actualización por <span className="text-stone-400">{page.updatedBy}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {canDelete && (
            <button 
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres eliminar esta página? Esta acción no se puede deshacer.')) {
                  onDelete();
                }
              }}
              className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded border border-red-900/50 text-sm transition-colors"
            >
              Eliminar
            </button>
          )}
          <button 
            onClick={onViewHistory}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded border border-stone-600 text-sm transition-colors"
          >
            Historial
          </button>
          <button 
            onClick={onEdit}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-600 text-sm transition-colors"
          >
            Editar
          </button>
        </div>
      </div>

      <div className="prose prosemirror-stone prose-invert max-w-none prose-headings:font-title prose-headings:text-red-400 prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, href, children, ...props }) => {
              const isExternal = href?.startsWith('http');
              return (
                <a 
                  href={href} 
                  onClick={(e) => {
                    if (!isExternal && href) {
                      e.preventDefault();
                      onNavigate(href);
                    }
                  }}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  {...props}
                >
                  {children}
                </a>
              );
            }
          }}
        >
          {page.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default WikiViewer;
