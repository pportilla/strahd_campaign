import React, { useState, useEffect } from 'react';
import { WikiPage, WikiHistoryEntry, PlayerId, WikiCategory } from '../../types';
import { wikiService } from '../../services/wikiService';
import WikiHome from './WikiHome';
import WikiViewer from './WikiViewer';
import WikiEditor from './WikiEditor';
import WikiHistory from './WikiHistory';

interface WikiProps {
  currentPlayerId: PlayerId;
}

const Wiki: React.FC<WikiProps> = ({ currentPlayerId }) => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation History
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Edit History View
  const [viewingHistory, setViewingHistory] = useState(false);
  const [pageHistory, setPageHistory] = useState<WikiHistoryEntry[]>([]);
  const [viewingVersion, setViewingVersion] = useState<WikiHistoryEntry | null>(null);

  const loadPages = async () => {
    try {
      const fetchedPages = await wikiService.getAllPages();
      setPages(fetchedPages);
    } catch (err) {
      console.error("Error loading wiki pages:", err);
      setError("No se pudo cargar el grimorio.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleNavigate = (slug: string | null) => {
    if (slug === currentSlug) return;

    // If we are navigating to a new page (not back/forward), add to stack
    const newStack = historyStack.slice(0, historyIndex + 1);
    if (slug) {
      newStack.push(slug);
    } else {
      // Navigating to home (null slug)
      // We can represent home as 'HOME' in stack or handle it differently.
      // Let's just push 'HOME' string for internal tracking
      newStack.push('HOME');
    }
    
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    
    setCurrentSlug(slug);
    setIsEditing(false);
    setViewingHistory(false);
    setViewingVersion(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const slug = historyStack[newIndex];
      setCurrentSlug(slug === 'HOME' ? null : slug);
      setViewingHistory(false);
      setViewingVersion(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const slug = historyStack[newIndex];
      setCurrentSlug(slug === 'HOME' ? null : slug);
      setViewingHistory(false);
      setViewingVersion(null);
    }
  };

  const handleSave = async (submittedSlug: string, title: string, content: string, category: WikiCategory) => {
    try {
      // If we are editing an existing page (currentSlug is set) and the submitted slug is different
      if (currentSlug && currentSlug !== submittedSlug) {
        await wikiService.renamePage(currentSlug, submittedSlug);
      }

      // Save the content (to the new slug if renamed, or existing if not)
      await wikiService.savePage(submittedSlug, title, content, category, currentPlayerId);
      await loadPages();
      
      // Navigate to the correct slug
      if (currentSlug !== submittedSlug) {
        handleNavigate(submittedSlug);
      } else {
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error("Error saving page:", err);
      alert(`Error al guardar la página: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!currentSlug) return;
    try {
      await wikiService.deletePage(currentSlug);
      await loadPages();
      handleNavigate(null); // Go back to home
    } catch (err) {
      console.error("Error deleting page:", err);
      alert("Error al eliminar la página.");
    }
  };

  const handleViewHistory = async () => {
    if (!currentSlug) return;
    try {
      const history = await wikiService.getPageHistory(currentSlug);
      setPageHistory(history);
      setViewingHistory(true);
    } catch (err) {
      console.error("Error loading history:", err);
      alert("No se pudo cargar el historial.");
    }
  };

  if (isLoading) return <div className="text-stone-400 text-center py-10">Consultando los archivos...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  // Navigation Controls
  const navControls = (
    <div className="flex gap-2 mb-4">
      <button 
        onClick={handleBack} 
        disabled={historyIndex <= 0}
        className="px-2 py-1 bg-stone-800 text-stone-400 rounded disabled:opacity-30 hover:bg-stone-700"
      >
        ←
      </button>
      <button 
        onClick={handleForward} 
        disabled={historyIndex >= historyStack.length - 1}
        className="px-2 py-1 bg-stone-800 text-stone-400 rounded disabled:opacity-30 hover:bg-stone-700"
      >
        →
      </button>
      <button
        onClick={() => handleNavigate(null)}
        className="px-2 py-1 bg-stone-800 text-stone-400 rounded hover:bg-stone-700 text-sm"
      >
        Índice
      </button>
    </div>
  );

  // Editor Mode
  if (isEditing) {
    const currentPage = currentSlug ? pages.find(p => p.id === currentSlug) : null;
    const isCreator = currentPage ? currentPage.createdBy === currentPlayerId : true; // New pages are created by current user

    return (
      <div>
        {navControls}
        <WikiEditor 
          slug={currentSlug || ''}
          initialTitle={currentPage?.title || ''}
          initialContent={currentPage?.content || ''}
          initialCategory={currentPage?.category || 'other'}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          isCreator={isCreator}
        />
      </div>
    );
  }

  // History Mode
  if (viewingHistory && currentSlug) {
    if (viewingVersion) {
      // Viewing a specific past version
      return (
        <div>
          {navControls}
          <div className="bg-amber-900/20 border border-amber-700/50 p-2 mb-4 rounded text-center text-amber-200 text-sm">
            Estás viendo una versión antigua del {viewingVersion.timestamp?.toDate ? viewingVersion.timestamp.toDate().toLocaleString() : 'pasado'}.
            <button 
              onClick={() => setViewingVersion(null)}
              className="ml-4 underline hover:text-amber-100"
            >
              Volver al historial
            </button>
          </div>
          <WikiViewer 
            page={{
              id: currentSlug,
              title: viewingVersion.title,
              content: viewingVersion.content,
              lastUpdated: viewingVersion.timestamp,
              updatedBy: viewingVersion.editorId,
              createdBy: undefined, // History versions don't track creator, so delete button won't show
              category: 'other'
            }}
            onNavigate={(slug) => handleNavigate(slug)}
            onEdit={() => {
              // Maybe warn that editing an old version will overwrite current?
              // For now, just let them edit this content as the new current
              setIsEditing(true);
              setViewingHistory(false);
              setViewingVersion(null);
            }}
            onViewHistory={() => setViewingVersion(null)}
            onDelete={() => {}}
            currentPlayerId={currentPlayerId}
          />
        </div>
      );
    }

    return (
      <div>
        {navControls}
        <WikiHistory 
          history={pageHistory}
          onClose={() => setViewingHistory(false)}
          onViewVersion={(entry) => setViewingVersion(entry)}
        />
      </div>
    );
  }

  // Viewer Mode
  if (currentSlug) {
    const currentPage = pages.find(p => p.id === currentSlug);
    if (currentPage) {
      return (
        <div>
          {navControls}
          <WikiViewer 
            page={currentPage}
            onNavigate={(slug) => handleNavigate(slug)}
            onEdit={() => setIsEditing(true)}
            onViewHistory={handleViewHistory}
            onDelete={handleDelete}
            currentPlayerId={currentPlayerId}
          />
        </div>
      );
    } else {
      return (
        <div>
          {navControls}
          <div className="text-center py-20">
            <p className="text-stone-400 mb-4">Esta página no existe aún en los archivos.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => handleNavigate(null)}
                className="text-stone-500 hover:text-stone-300"
              >
                Volver al índice
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-red-400 hover:text-red-300"
              >
                Crear "{currentSlug}"
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Home/List Mode
  return (
    <div>
      {/* Only show forward if we have history forward */}
      <div className="flex gap-2 mb-4">
         <button 
          onClick={handleBack} 
          disabled={historyIndex <= 0}
          className="px-2 py-1 bg-stone-800 text-stone-400 rounded disabled:opacity-30 hover:bg-stone-700"
        >
          ←
        </button>
        <button 
          onClick={handleForward} 
          disabled={historyIndex >= historyStack.length - 1}
          className="px-2 py-1 bg-stone-800 text-stone-400 rounded disabled:opacity-30 hover:bg-stone-700"
        >
          →
        </button>
      </div>
      <WikiHome 
        pages={pages}
        onNavigate={(slug) => handleNavigate(slug)}
        onCreate={() => {
          handleNavigate('new-page'); // Placeholder slug
          setCurrentSlug(''); // Clear it for editor
          setIsEditing(true);
        }}
      />
    </div>
  );
};

export default Wiki;
