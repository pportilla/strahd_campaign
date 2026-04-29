import useLocalStorage from '../hooks/useLocalStorage.tsx';

const Notes = () => {
  const [notes, setNotes] = useLocalStorage<string>('strahd-notes', 'Anota tus pistas y miedos aquí...');

  return (
    <div className="flex-grow flex flex-col">
      <h2 className="font-title text-2xl text-stone-900 border-b border-stone-400/50 pb-2 mb-4 text-center">Notas de Campaña</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full flex-grow p-3 bg-black/5 border border-stone-400/50 rounded-md focus:ring-1 focus:ring-red-700 focus:border-red-700 transition-colors text-stone-800 resize-none"
        placeholder="¿Qué horrores has presenciado?"
        aria-label="Notas de Campaña"
      />
    </div>
  );
};

export default Notes;