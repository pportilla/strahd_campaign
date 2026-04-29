import { useState, FormEvent } from 'react';
import { Player, PlayerId } from '../types.ts';
import PlayerAvatar from './PlayerAvatar.tsx';

interface LoginPageProps {
  onLoginSuccess: (id: PlayerId) => void;
  isExiting: boolean;
  players: Player[];
}

const LoginPage = ({ onLoginSuccess, isExiting, players }: LoginPageProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  const handlePlayerSelect = (id: PlayerId) => {
    setSelectedPlayerId(id);
    setPassword(''); // Reset password field on new selection
    setError(''); // Clear any previous errors
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    if (selectedPlayer.password === password) {
      onLoginSuccess(selectedPlayer.id);
    } else {
      setError('Contraseña incorrecta. Las nieblas se espesan...');
    }
  };
  
  // Overall container animation for login screen exit
  const containerClasses = `fixed inset-0 overflow-y-auto transition-all duration-1000 ease-in-out ${
    isExiting ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
  }`;

  return (
    <div className={containerClasses}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 shadow-2xl shadow-black/60 rounded-lg overflow-hidden border border-black/30">
          
          {/* Left Panel: Player Selection */}
        <div className="p-6 sm:p-8 bg-stone-900/50 backdrop-blur-sm">
          <h1 className="font-title text-4xl text-center text-red-500 mb-2">La Maldición de Strahd</h1>
          <p className="text-center text-stone-400 mb-6">¿Quién se atreve a entrar en Barovia?</p>
          <div className="space-y-3">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-md text-left transition-all duration-200 border-2 ${
                  selectedPlayerId === player.id
                    ? `bg-red-900/40 ${player.borderColor} animate-pulse-border`
                    : 'bg-black/20 border-transparent hover:bg-black/40'
                }`}
              >
                <PlayerAvatar player={player} size="sm" />
                <div>
                  <p className={`font-bold ${player.textColor}`}>{player.name}</p>
                  <p className="text-sm text-stone-400">{player.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="p-6 sm:p-8 bg-stone-900/50 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px]">
          {selectedPlayer ? (
            <div className="w-full text-center animate-fade-in">
              <div className="flex justify-center mb-4">
                <PlayerAvatar player={selectedPlayer} size="xl" />
              </div>
              <h2 className={`font-title text-4xl ${selectedPlayer.textColor}`}>{selectedPlayer.name}</h2>
              <p className="text-stone-400 mb-6">{selectedPlayer.role}</p>
              
              <form onSubmit={handleLogin} className="w-full max-w-sm mx-auto">
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce la Contraseña"
                  autoFocus
                  className="w-full px-4 py-2 text-center bg-black/30 text-stone-200 border-2 border-stone-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
                {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full mt-4 px-4 py-2 bg-red-800 text-stone-100 rounded transition-all duration-300 font-title tracking-wider hover:bg-red-900 hover:shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                >
                  Entrar en las Nieblas
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center text-stone-500 animate-fade-in">
              <p className="font-title text-2xl">Selecciona tu Personaje</p>
              <p>El Señor de esta tierra requiere tu identidad.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;