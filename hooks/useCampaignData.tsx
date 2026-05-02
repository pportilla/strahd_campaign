import { useCallback, useEffect, useMemo, useState } from 'react';
import { Availability, Player, PlayerId, Schedule } from '../types.ts';
import {
  fetchPlayers,
  fetchSchedule,
  removeAvailability,
  subscribeToPlayers,
  subscribeToSchedule,
  upsertAvailability,
  updatePlayer,
} from '../services/campaignApi.ts';

interface UseCampaignDataResult {
  players: Player[];
  schedule: Schedule;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  applyAvailability: (dates: string[], playerId: PlayerId, status: Availability) => Promise<void>;
  clearAvailability: (dates: string[], playerId: PlayerId) => Promise<void>;
  persistPlayer: (player: Player) => Promise<void>;
}

export const useCampaignData = (): UseCampaignDataResult => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    const data = await fetchPlayers();
    setPlayers(data);
  }, []);

  const loadSchedule = useCallback(async () => {
    const data = await fetchSchedule();
    setSchedule(data);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadPlayers(), loadSchedule()]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo sincronizar la campaña.');
    } finally {
      setIsLoading(false);
    }
  }, [loadPlayers, loadSchedule]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let playersUnsubscribe: (() => void) | undefined;
    let scheduleUnsubscribe: (() => void) | undefined;
    const handleSubscriptionError = (err: unknown) => {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la sincronización en tiempo real.');
    };

    try {
      playersUnsubscribe = subscribeToPlayers(loadPlayers, handleSubscriptionError);
      scheduleUnsubscribe = subscribeToSchedule(loadSchedule, handleSubscriptionError);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la sincronización en tiempo real.');
    }

    return () => {
      playersUnsubscribe?.();
      scheduleUnsubscribe?.();
    };
  }, [loadPlayers, loadSchedule]);

  const applyAvailability = useCallback(
    async (dates: string[], playerId: PlayerId, status: Availability) => {
      setSchedule(prev => {
        const updated: Schedule = { ...prev };
        dates.forEach(date => {
          const nextDay = { ...(updated[date] || {}) };
          nextDay[playerId] = status;
          updated[date] = nextDay;
        });
        return updated;
      });

      try {
        await upsertAvailability(dates, playerId, status);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'No se pudo guardar la disponibilidad.');
        await loadSchedule();
      }
    },
    [loadSchedule],
  );

  const clearAvailability = useCallback(
    async (dates: string[], playerId: PlayerId) => {
      setSchedule(prev => {
        const updated: Schedule = { ...prev };
        dates.forEach(date => {
          if (!updated[date]) return;
          const nextDay = { ...updated[date] };
          delete nextDay[playerId];
          if (Object.keys(nextDay).length === 0) {
            delete updated[date];
          } else {
            updated[date] = nextDay;
          }
        });
        return updated;
      });

      try {
        await removeAvailability(dates, playerId);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'No se pudo limpiar la disponibilidad.');
        await loadSchedule();
      }
    },
    [loadSchedule],
  );

  const persistPlayer = useCallback(async (player: Player) => {
    setPlayers(prev => prev.map(p => (p.id === player.id ? player : p)));
    try {
      await updatePlayer(player);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el jugador.');
      await loadPlayers();
    }
  }, [loadPlayers]);

  return useMemo(
    () => ({
      players,
      schedule,
      isLoading,
      error,
      refresh,
      applyAvailability,
      clearAvailability,
      persistPlayer,
    }),
    [applyAvailability, clearAvailability, error, isLoading, persistPlayer, players, refresh, schedule],
  );
};
