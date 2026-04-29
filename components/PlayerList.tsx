import { useState } from 'react';
import { Player, PlayerId } from '../types.ts';
import { EMOTICON_OPTIONS, THEME_COLORS } from '../constants.ts';
import PlayerAvatar from './PlayerAvatar.tsx';

interface PlayerListProps {
  activePlayerId: PlayerId;
  onLogout: () => void;
  players: Player[];
  onPlayerUpdate: (player: Player) => Promise<void>;
  isSaving: boolean;
}

const PlayerList = ({ activePlayerId, onLogout, players, onPlayerUpdate, isSaving }: PlayerListProps) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEditingColor, setIsEditingColor] = useState(false);
  const [isEditingEmoticon, setIsEditingEmoticon] = useState(false);

  const activePlayer = players.find(p => p.id === activePlayerId);

  if (!activePlayer) {
    return null; // Or some fallback UI
  }

  const handlePasswordSave = async () => {
    if (newPassword.length < 4) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    await onPlayerUpdate({ ...activePlayer, password: newPassword });
    setIsEditingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleColorSelect = async (colorInfo: typeof THEME_COLORS[0]) => {
    await onPlayerUpdate({ 
      ...activePlayer, 
      color: colorInfo.color,
      borderColor: colorInfo.borderColor,
      textColor: colorInfo.textColor,
    });
    setIsEditingColor(false);
  };

  const handleEmoticonSelect = async (imageUrl: string) => {
    await onPlayerUpdate({
      ...activePlayer,
      imageUrl,
    });
    setIsEditingEmoticon(false);
  };

  const passwordInputClasses = "w-full px-3 py-2 text-center bg-black/30 text-stone-200 border-2 border-stone-600 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";
  const buttonBaseClasses = "w-full px-4 py-2 rounded transition-all duration-300 font-title tracking-wider";
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
  const primaryButtonClasses = `${buttonBaseClasses} bg-stone-700/80 text-stone-100 hover:bg-stone-700 ${disabledClasses}`;
  const confirmButtonClasses = `${buttonBaseClasses} bg-green-800/80 text-stone-100 hover:bg-green-700 ${disabledClasses}`;
  const cancelButtonClasses = `${buttonBaseClasses} bg-gray-600/80 text-stone-100 hover:bg-gray-500 ${disabledClasses}`;
  const editingInProgress = isEditingPassword || isEditingColor || isEditingEmoticon;

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-stone-700/50 flex flex-col h-full">
      <div>
        <h2 className="font-title text-2xl text-stone-100 border-b border-stone-600 pb-2 mb-4 text-center">Tu Identidad</h2>
        <div className="flex flex-col items-center gap-4 text-center">
          <PlayerAvatar player={activePlayer} size="lg" />
          <div>
            <p className={`font-bold text-2xl font-title ${activePlayer.textColor}`}>{activePlayer.name}</p>
            <p className="text-md text-stone-400">{activePlayer.role}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow min-h-[2rem]"></div>

      {/* --- SETTINGS --- */}
      <div className="border-t border-stone-700/50 pt-6">
        <h3 className="font-title text-xl text-stone-100 mb-4 text-center">Ajustes de Cuenta</h3>

        {/* --- Password Changer --- */}
        {!editingInProgress && (
          <div className="space-y-2">
            <button 
              onClick={() => setIsEditingPassword(true)}
              className={primaryButtonClasses}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
            <button 
              onClick={() => setIsEditingColor(true)}
              className={primaryButtonClasses}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Cambiar Color'}
            </button>
            <button
              onClick={() => setIsEditingEmoticon(true)}
              className={primaryButtonClasses}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Cambiar Emoticono'}
            </button>
          </div>
        )}
        {isEditingPassword && (
          <div className="space-y-3 animate-fade-in">
            <input type="password" placeholder="Nueva Contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={passwordInputClasses} autoFocus />
            <input type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={passwordInputClasses} />
            {passwordError && <p className="text-red-400 text-sm text-center">{passwordError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setIsEditingPassword(false); setPasswordError(''); }} className={cancelButtonClasses} disabled={isSaving}>Cancelar</button>
              <button onClick={handlePasswordSave} className={confirmButtonClasses} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        )}

        {/* --- Color Changer --- */}
        {isEditingColor && (
          <div className="animate-fade-in">
            <p className="text-center text-stone-400 mb-3">Selecciona un nuevo color de tema:</p>
            <div className="grid grid-cols-4 gap-2">
              {THEME_COLORS.map(c => (
                <button key={c.name} onClick={() => handleColorSelect(c)} className={`h-10 rounded ${c.color} border-2 ${c.borderColor} hover:scale-110 transition-transform focus:ring-2 ring-offset-2 ring-offset-stone-800 ring-white disabled:opacity-50`} title={c.name} aria-label={`Seleccionar color ${c.name}`} disabled={isSaving}></button>
              ))}
            </div>
             <button onClick={() => setIsEditingColor(false)} className={`${cancelButtonClasses} mt-3`} disabled={isSaving}>Cancelar</button>
          </div>
        )}

        {isEditingEmoticon && (
          <div className="animate-fade-in">
            <p className="text-center text-stone-400 mb-3">Elige un nuevo avatar:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-72 overflow-y-auto pr-1 p-2">
              {EMOTICON_OPTIONS.map(option => {
                const isActive = option.imageUrl === activePlayer.imageUrl;
                return (
                  <button
                    key={option.name}
                    onClick={() => handleEmoticonSelect(option.imageUrl)}
                    className={`relative flex items-center justify-center rounded-xl p-2 transition-all hover:scale-110 focus:ring-2 ring-offset-2 ring-offset-stone-900 ${isActive ? 'ring-red-400 bg-white/10' : 'ring-transparent hover:bg-white/5'} ${disabledClasses}`}
                    title={option.name}
                    aria-label={`Seleccionar emoticono ${option.name}`}
                    disabled={isSaving}
                  >
                    <img 
                      src={option.imageUrl} 
                      alt={option.name} 
                      className="w-16 h-16 object-contain drop-shadow-lg" 
                    />
                  </button>
                );
              })}
            </div>
            <button onClick={() => setIsEditingEmoticon(false)} className={`${cancelButtonClasses} mt-3`} disabled={isSaving}>Cancelar</button>
          </div>
        )}
      </div>

      <div className="mt-6">
          <button 
              onClick={onLogout}
              className="w-full px-4 py-2 bg-red-800 text-stone-100 rounded transition-all duration-300 font-title tracking-wider hover:bg-red-900 hover:shadow-[0_0_15px_rgba(220,38,38,0.6)]"
          >
              Huir de Barovia (Salir)
          </button>
      </div>
    </div>
  );
};

export default PlayerList;