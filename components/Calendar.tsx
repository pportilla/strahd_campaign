import { useState } from 'react';
import { Schedule, PlayerId, Availability, Player } from '../types.ts';
import { AVAILABILITY_STYLES } from '../constants.ts';
import PlayerAvatar from './PlayerAvatar.tsx';

type CalendarView = 'week' | 'month';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  schedule: Schedule;
  activePlayerId: PlayerId;
  players: Player[];
  view: CalendarView;
  setView: (view: CalendarView) => void;
  onApplyAvailability: (dates: string[], status: Availability) => Promise<void> | void;
  onClearAvailability: (dates: string[]) => Promise<void> | void;
  isUpdating: boolean;
}

const availabilityTranslations: Record<Availability, string> = {
  available: 'Disponible',
  maybe: 'Quizás',
  unavailable: 'No disponible'
};

const AVAILABILITY_DOT_COLORS: Record<Availability, string> = {
  available: 'bg-green-500',
  maybe: 'bg-amber-500',
  unavailable: 'bg-red-600',
};

const getWeekDays = (date: Date): Date[] => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  start.setDate(diff);
  
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(start);
    nextDay.setDate(start.getDate() + i);
    week.push(nextDay);
  }
  return week;
};

const getMonthGrid = (date: Date): Date[] => {
  const month = date.getMonth();
  const year = date.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay();

  // Adjust to start the week on Monday (0=Sun, 1=Mon, ..., 6=Sat)
  const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - dayOffset);

  const grid: Date[] = [];
  // 6 weeks * 7 days = 42 days, ensures a full grid display
  for (let i = 0; i < 42; i++) {
    const gridDay = new Date(startDate);
    gridDay.setDate(startDate.getDate() + i);
    grid.push(gridDay);
  }
  return grid;
};


const Calendar = ({
  currentDate,
  setCurrentDate,
  schedule,
  activePlayerId,
  players,
  view,
  setView,
  onApplyAvailability,
  onClearAvailability,
  isUpdating,
}: CalendarProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  const handlePrev = () => {
    setSelectedDays([]);
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    setSelectedDays([]);
    const newDate = new Date(currentDate);
     if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const handleDayClick = (dateKey: string) => {
    setSelectedDays(prevSelected =>
      prevSelected.includes(dateKey)
        ? prevSelected.filter(d => d !== dateKey)
        : [...prevSelected, dateKey],
    );
  };

  const handleApplyAction = async (status: Availability) => {
    if (selectedDays.length === 0) return;
    await onApplyAvailability(selectedDays, status);
    setSelectedDays([]);
  };

  const handleClearAvailability = async () => {
    if (selectedDays.length === 0) return;
    await onClearAvailability(selectedDays);
    setSelectedDays([]);
  };

  const getWeekTitle = (week: Date[]): string => {
    if (!week || week.length === 0) return '';
    const start = week[0];
    const end = week[6];
    const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const yearFormatter = new Intl.DateTimeFormat('es-ES', { year: 'numeric' });
    if (start.getMonth() !== end.getMonth()) {
      return `${start.getDate()} de ${monthFormatter.format(start)} - ${end.getDate()} de ${monthFormatter.format(end)}, ${yearFormatter.format(end)}`;
    }
    return `Semana del ${start.getDate()} al ${end.getDate()} de ${monthFormatter.format(start)}, ${yearFormatter.format(start)}`;
  };
  
  const getMonthTitle = (date: Date): string => {
      return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    return (
      <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[700px] sm:min-w-0">
          {weekDays.map(dayDate => {
            const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
            const daySchedule = schedule[dateKey] || {};
            const isSelected = selectedDays.includes(dateKey);
            const isToday = dayDate.toDateString() === new Date().toDateString();

            return (
              <div key={dateKey} onClick={() => handleDayClick(dateKey)} className={`rounded-md sm:rounded-lg p-1 sm:p-2 flex flex-col cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'border-red-500 bg-black/40' : 'border-transparent hover:bg-black/20'}`}>
                <div className="text-center mb-2">
                  <p className="text-xs sm:text-sm text-stone-400 font-semibold">{new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dayDate)}</p>
                  <p className={`font-bold text-lg sm:text-xl ${isToday ? 'text-red-400' : 'text-stone-200'}`}>{dayDate.getDate()}</p>
                </div>
                <div className="flex-grow space-y-1.5">
                  {players.map(player => {
                    const availability = daySchedule[player.id];
                    const style = availability ? AVAILABILITY_STYLES[availability] : 'bg-stone-800/50 text-stone-400';
                    return (
                      <div key={player.id} title={`${player.name}: ${availability ? availabilityTranslations[availability] : 'Sin definir'}`} className={`p-1.5 rounded text-center text-xs font-semibold truncate transition-transform hover:scale-105 ${style}`}>
                        <span className="hidden sm:inline">{player.name}</span>
                        <span className="inline sm:hidden">{player.name.substring(0,3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthGrid(currentDate);
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return (
      <>
        <div className="grid grid-cols-7 text-center mb-2">
          {dayNames.map(name => <div key={name} className="text-stone-400 font-bold text-sm">{name}</div>)}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-1">
          {monthDays.map((dayDate, i) => {
            const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
            const daySchedule = schedule[dateKey] || {};
            const isSelected = selectedDays.includes(dateKey);
            const isToday = dayDate.toDateString() === new Date().toDateString();
            const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();

            return (
              <div key={i} onClick={() => handleDayClick(dateKey)} className={`relative aspect-square rounded p-1 cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'border-red-500 bg-black/40' : 'border-transparent hover:bg-black/20'} ${!isCurrentMonth ? 'bg-black/20' : 'bg-transparent'}`}>
                <p className={`text-sm ${isToday ? 'text-red-400 font-bold' : isCurrentMonth ? 'text-stone-200' : 'text-stone-600'}`}>
                  {dayDate.getDate()}
                </p>
                 <div className="absolute bottom-1 left-1 right-1 flex flex-wrap justify-center items-center gap-0.5">
          {players.map(player => {
            const availability = daySchedule[player.id];
            if (!availability) return null;
                        
            return (
              <div
                key={player.id}
                className="relative"
                title={`${player.name}: ${availabilityTranslations[availability]}`}
              >
                <PlayerAvatar player={player} size="xs" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-stone-800 ${AVAILABILITY_DOT_COLORS[availability]}`}></div>
              </div>
            );
          })}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };
  
  return (
    <div className="bg-black/20 p-6 rounded-lg border border-stone-700/50">
      <div className="flex flex-wrap items-center justify-between gap-y-4 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="p-2 rounded-full hover:bg-stone-700 transition-colors" aria-label="Anterior">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
           <button onClick={handleNext} className="p-2 rounded-full hover:bg-stone-700 transition-colors" aria-label="Siguiente">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <h2 className="font-title text-xl sm:text-2xl text-stone-100 text-center mx-auto px-4 capitalize">
          {view === 'week' ? getWeekTitle(getWeekDays(currentDate)) : getMonthTitle(currentDate)}
        </h2>
        <div className="flex bg-black/20 p-1 rounded-md border border-stone-700">
            <button onClick={() => setView('week')} className={`px-3 py-1 text-sm rounded transition-colors ${view === 'week' ? 'bg-red-800 text-white' : 'text-stone-300 hover:bg-stone-700'}`}>Semana</button>
            <button onClick={() => setView('month')} className={`px-3 py-1 text-sm rounded transition-colors ${view === 'month' ? 'bg-red-800 text-white' : 'text-stone-300 hover:bg-stone-700'}`}>Mes</button>
        </div>
      </div>
      
      {view === 'week' ? renderWeekView() : renderMonthView()}

      <div className="mt-6">
        <h3 className="font-title text-xl text-stone-100 text-center mb-4">
          Definir disponibilidad para {selectedDays.length} día{selectedDays.length !== 1 ? 's' : ''} seleccionado{selectedDays.length !== 1 ? 's' : ''}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => handleApplyAction('available')} disabled={!selectedDays.length || isUpdating} className="p-3 bg-green-800/80 text-stone-100 rounded transition-all duration-300 font-title tracking-wider hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Disponible</button>
            <button onClick={() => handleApplyAction('maybe')} disabled={!selectedDays.length || isUpdating} className="p-3 bg-amber-600/80 text-stone-100 rounded transition-all duration-300 font-title tracking-wider hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed">Quizás</button>
            <button onClick={() => handleApplyAction('unavailable')} disabled={!selectedDays.length || isUpdating} className="p-3 bg-red-800/80 text-stone-100 rounded transition-all duration-300 font-title tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">No disponible</button>
            <button onClick={handleClearAvailability} disabled={!selectedDays.length || isUpdating} className="p-3 bg-stone-600/80 text-stone-100 rounded transition-all duration-300 font-title tracking-wider hover:bg-stone-500 disabled:opacity-50 disabled:cursor-not-allowed">Limpiar</button>
        </div>
        {isUpdating && <p className="text-center text-sm text-stone-400 mt-3">Guardando cambios en el grimorio...</p>}
      </div>
    </div>
  );
};

export default Calendar;