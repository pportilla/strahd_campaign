import React, { useState } from 'react';
import { WikiPage, WikiCategory } from '../../types';

interface WikiEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: WikiCategory;
  slug: string;
  onSave: (slug: string, title: string, content: string, category: WikiCategory) => Promise<void>;
  onCancel: () => void;
  isCreator: boolean;
}

const WikiEditor: React.FC<WikiEditorProps> = ({ 
  initialTitle = '', 
  initialContent = '', 
  initialCategory = 'other',
  slug, 
  onSave, 
  onCancel,
  isCreator
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [category, setCategory] = useState<WikiCategory>(initialCategory);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSaving(true);
    try {
      await onSave(currentSlug, title, content, category);
    } finally {
      setIsSaving(false);
    }
  };

  const isNewPage = !slug;
  const canEditSlug = isNewPage || isCreator;

  return (
    <div className="bg-stone-900/80 p-6 rounded-lg border border-stone-700 min-h-[600px] flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-stone-700 pb-4 gap-4">
        <h2 className="text-2xl font-title text-stone-300">
          {initialTitle ? 'Editar Página' : 'Nueva Página'}
        </h2>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={onCancel}
            disabled={isSaving}
            className="px-3 py-1 bg-transparent hover:bg-stone-800 text-stone-400 rounded border border-stone-600 text-sm transition-colors flex-1 sm:flex-none"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="px-3 py-1 bg-red-900/50 hover:bg-red-800/50 text-red-200 rounded border border-red-800 text-sm transition-colors disabled:opacity-50 flex-1 sm:flex-none"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-stone-500 uppercase tracking-wider">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-black/30 border border-stone-700 rounded p-2 text-stone-200 focus:border-red-500 focus:outline-none font-title text-xl"
          placeholder="Título de la página"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-stone-500 uppercase tracking-wider">Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as WikiCategory)}
          className="bg-black/30 border border-stone-700 rounded p-2 text-stone-200 focus:border-red-500 focus:outline-none"
        >
          <option value="other">Otras Entradas</option>
          <option value="pinned">Entradas Fijas</option>
          <option value="session">Sesiones</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-stone-500 uppercase tracking-wider flex items-center gap-2">
          Slug (Identificador)
          {!canEditSlug && <span className="text-stone-600 text-[10px]">(Solo el creador puede modificarlo)</span>}
        </label>
        <input
          type="text"
          value={currentSlug}
          onChange={(e) => setCurrentSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          disabled={!canEditSlug}
          className={`bg-black/30 border border-stone-700 rounded p-2 text-stone-200 font-mono text-sm focus:border-red-500 focus:outline-none ${!canEditSlug ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={isNewPage ? "se-generara-automaticamente-si-vacio" : "slug-de-la-pagina"}
        />
        <p className="text-[10px] text-stone-500">
          Este es el identificador único usado para enlazar esta página: <code className="text-amber-700">[Link]({currentSlug || '...'})</code>
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        <div className="flex justify-between items-end">
          <label className="text-xs text-stone-500 uppercase tracking-wider">Contenido (Markdown)</label>
          <a 
            href="https://www.markdownguide.org/cheat-sheet/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-amber-600 hover:text-amber-500"
          >
            Guía de Markdown
          </a>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-black/30 border border-stone-700 rounded p-4 text-stone-300 focus:border-red-500 focus:outline-none font-mono text-sm flex-grow min-h-[400px] resize-none"
          placeholder="# Escribe aquí tu contenido..."
        />
      </div>
      
      <div className="text-xs text-stone-600 bg-black/20 p-2 rounded">
        <p>Tips:</p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Usa <code className="bg-black/40 px-1 rounded"># Título</code> para encabezados</li>
          <li>Usa <code className="bg-black/40 px-1 rounded">**negrita**</code> para texto importante</li>
          <li>Para enlazar a otra página wiki, usa <code className="bg-black/40 px-1 rounded">[Texto del enlace](slug-de-la-pagina)</code></li>
        </ul>
      </div>
    </div>
  );
};

export default WikiEditor;
