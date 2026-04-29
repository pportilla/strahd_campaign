import { useState, useEffect } from 'react';
import { Availability, Player, PlayerId } from './types.ts';
import useLocalStorage from './hooks/useLocalStorage.tsx';
import Calendar from './components/Calendar.tsx';
import PlayerList from './components/PlayerList.tsx';
import LoginPage from './components/LoginPage.tsx';
import Wiki from './components/Wiki/Wiki.tsx';
import { useCampaignData } from './hooks/useCampaignData.tsx';
import Spells from './components/Spells/Spells.tsx';
import CharacterCreator from './components/CharacterCreator';

const App = () => {
  const {
    players,
    schedule,
    isLoading,
    error,
    refresh,
    applyAvailability,
    clearAvailability,
    persistPlayer,
  } = useCampaignData();
  const [loggedInPlayer, setLoggedInPlayer] = useLocalStorage<PlayerId | null>('strahd-loggedInUser', null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExitingLogin, setIsExitingLogin] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(false);
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [viewMode, setViewMode] = useState<'calendar' | 'wiki' | 'spells' | 'character'>('calendar');
  const [isScheduleSaving, setIsScheduleSaving] = useState(false);
  const [isPlayerSaving, setIsPlayerSaving] = useState(false);

  useEffect(() => {
    if (loggedInPlayer) {
      // Use a short timeout to ensure the fade-in animation plays after the component is rendered
      const timer = setTimeout(() => setIsAppVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsAppVisible(false);
    }
  }, [loggedInPlayer]);

  useEffect(() => {
    if (!loggedInPlayer || isLoading) return;
    const stillExists = players.some(player => player.id === loggedInPlayer);
    if (!stillExists) {
      setLoggedInPlayer(null);
    }
  }, [loggedInPlayer, players, isLoading, setLoggedInPlayer]);

  const handleLogin = (playerId: PlayerId) => {
    setIsExitingLogin(true); // Start exit animation
    setTimeout(() => {
      setLoggedInPlayer(playerId);
    }, 1000); // Wait for animation to finish before switching components
  };

  const handleLogout = () => {
    setLoggedInPlayer(null);
    setIsExitingLogin(false); // Reset state for the next login
  };

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    setIsPlayerSaving(true);
    return persistPlayer(updatedPlayer)
      .finally(() => setIsPlayerSaving(false));
  };

  const handleApplyAvailability = async (dates: string[], status: Availability) => {
    if (!loggedInPlayer) return;
    setIsScheduleSaving(true);
    try {
      await applyAvailability(dates, loggedInPlayer, status);
    } finally {
      setIsScheduleSaving(false);
    }
  };

  const handleClearAvailability = async (dates: string[]) => {
    if (!loggedInPlayer) return;
    setIsScheduleSaving(true);
    try {
      await clearAvailability(dates, loggedInPlayer);
    } finally {
      setIsScheduleSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-200">
        <p className="text-xl font-title tracking-widest">Sincronizando con las nieblas...</p>
      </div>
    );
  }

  if (!players.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-200 text-center">
        <p className="text-2xl font-title">No hay aventureros registrados.</p>
        <p className="text-stone-400 max-w-lg">
          Crea documentos en la colección <code className="px-2 py-1 bg-black/30 rounded">players</code> de tu base de datos Firebase para comenzar.
        </p>
        <button onClick={refresh} className="px-4 py-2 bg-red-700 rounded font-title tracking-widest hover:bg-red-600">
          Reintentar sincronización
        </button>
      </div>
    );
  }

  if (!loggedInPlayer) {
    return <LoginPage onLoginSuccess={handleLogin} isExiting={isExitingLogin} players={players} />;
  }

  const mainAppContainerClasses = `transition-opacity duration-1000 ease-out ${isAppVisible ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className={mainAppContainerClasses}>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto bg-stone-900/50 backdrop-blur-sm text-stone-300 rounded-lg shadow-2xl shadow-black/60 border border-black/30 p-6 md:p-8">
          {error && (
            <div className="mb-4 rounded border border-amber-600 bg-amber-900/40 text-amber-100 px-4 py-3 flex flex-wrap items-center gap-4">
              <span>{error}</span>
              <button onClick={refresh} className="px-3 py-1 bg-amber-700/80 rounded font-semibold text-sm">Reintentar</button>
            </div>
          )}
          <header className="text-center mb-8">
            <h1 className="font-title text-4xl sm:text-5xl md:text-6xl text-red-500 tracking-wider">La Maldición de Strahd</h1>
            <p className="text-stone-400 text-lg">Planificador de Campaña</p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8 order-2 lg:order-1">
              <PlayerList
                players={players}
                activePlayerId={loggedInPlayer}
                onLogout={handleLogout}
                onPlayerUpdate={handlePlayerUpdate}
                isSaving={isPlayerSaving}
              />
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="flex gap-4 mb-6 border-b border-stone-700 pb-2 overflow-x-auto">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 font-title text-xl transition-colors whitespace-nowrap ${viewMode === 'calendar' ? 'text-red-500 border-b-2 border-red-500' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  Calendario
                </button>
                <button
                  onClick={() => setViewMode('wiki')}
                  className={`px-4 py-2 font-title text-xl transition-colors whitespace-nowrap ${viewMode === 'wiki' ? 'text-red-500 border-b-2 border-red-500' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  Diario de Aventura
                </button>
                <button
                  onClick={() => setViewMode('spells')}
                  className={`px-4 py-2 font-title text-xl transition-colors whitespace-nowrap ${viewMode === 'spells' ? 'text-red-500 border-b-2 border-red-500' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  Grimorio
                </button>
                <button
                  onClick={() => setViewMode('character')}
                  className={`px-4 py-2 font-title text-xl transition-colors whitespace-nowrap ${viewMode === 'character' ? 'text-red-500 border-b-2 border-red-500' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  Personaje
                </button>
              </div>

              {viewMode === 'calendar' && (
                <Calendar
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  schedule={schedule}
                  activePlayerId={loggedInPlayer}
                  players={players}
                  view={calendarView}
                  setView={setCalendarView}
                  onApplyAvailability={handleApplyAvailability}
                  onClearAvailability={handleClearAvailability}
                  isUpdating={isScheduleSaving}
                />
              )}
              {viewMode === 'wiki' && (
                <Wiki currentPlayerId={loggedInPlayer} />
              )}
              {viewMode === 'spells' && (
                <Spells />
              )}
              {viewMode === 'character' && (
                <CharacterCreator />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;