import React from 'react';
import { WikiHistoryEntry } from '../../types';

interface WikiHistoryProps {
  history: WikiHistoryEntry[];
  onClose: () => void;
  onViewVersion: (entry: WikiHistoryEntry) => void;
}

const WikiHistory: React.FC<WikiHistoryProps> = ({ history, onClose, onViewVersion }) => {
  return (
    <div className="bg-stone-900/80 p-6 rounded-lg border border-stone-700 min-h-[600px]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-stone-700 pb-4 gap-4">
        <h2 className="text-2xl font-title text-stone-300">Historial de Cambios</h2>
        <button 
          onClick={onClose}
          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-600 text-sm transition-colors w-full sm:w-auto"
        >
          Volver a la Página
        </button>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-stone-500 text-center py-8">No hay historial disponible para esta página.</p>
        ) : (
          history.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-black/20 border border-stone-800 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-black/30 transition-colors gap-2"
            >
              <div>
                <p className="text-stone-300 font-semibold">
                  Editado por <span className="text-red-400">{entry.editorId}</span>
                </p>
                <p className="text-xs text-stone-500">
                  {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString() : 'Fecha desconocida'}
                </p>
              </div>
              <button
                onClick={() => onViewVersion(entry)}
                className="px-3 py-1 bg-stone-800/50 hover:bg-stone-700/50 text-stone-400 text-xs rounded border border-stone-700 w-full sm:w-auto"
              >
                Ver Versión
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WikiHistory;
