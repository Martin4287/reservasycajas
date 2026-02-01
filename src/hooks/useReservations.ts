import { useState, useEffect, useCallback } from 'react';
import type { Reservation } from '../types';

const SHEET_APP_URL = 'https://script.google.com/macros/s/AKfycbxEsBkxtwNacKn8gmcsTxWu2CUzwilfpG71HQOsuvrZL0IXmAr3AjC9OjIohtXoewx-/exec'; 

export const useReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [, setForceUpdate] = useState(0);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${SHEET_APP_URL}?t=${new Date().getTime()}`);
            if (!res.ok) {
                throw new Error(`Error en la solicitud: ${res.status}`);
            }
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            const parsedData = data.map((r: any) => ({
                ...r,
                id: String(r.id), // Ensure id is always a string
                // No parsing needed for fecha or hora anymore, as getDisplayValues() returns clean strings.
                cantidad: Number(r.cantidad) || 1,
                arrived: r.arrived === true || String(r.arrived).toLowerCase() === 'true',
            }));
            setReservations(parsedData);
        } catch (e: any) {
            console.error("Fallo al obtener las reservas:", e);
            setError('No se pudieron cargar las reservas. Verifica la URL del script y los permisos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setForceUpdate(tick => tick + 1);
        }, 60000); 

        return () => clearInterval(intervalId);
    }, []);

    const addReservation = useCallback(async (newReservation: Omit<Reservation, 'id' | 'arrived'>) => {
        setLoading(true);
        try {
            const response = await fetch(SHEET_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({ action: 'addReservation', reservation: newReservation })
            });
            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Fallo al agregar la reserva');
            }
            await fetchReservations(); 
        } catch (e: any) {
            console.error("Fallo al agregar la reserva:", e);
            setError('No se pudo guardar la reserva. Por favor, inténtalo de nuevo.');
            setLoading(false);
            throw e; // Re-throw error to be caught by the form component
        }
    }, [fetchReservations]);

    const updateReservationStatus = useCallback(async (id: string, arrived: boolean) => {
        const originalReservations = [...reservations];
        setReservations(prev => 
            prev.map(res => res.id === id ? { ...res, arrived } : res)
        );

        try {
             const response = await fetch(SHEET_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({ action: 'updateStatus', id, arrived })
            });
            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Fallo al actualizar el estado');
            }
        } catch (e: any) {
            console.error("Fallo al actualizar el estado:", e);
            setError('No se pudo actualizar el estado de la reserva.');
            setReservations(originalReservations);
        }
    }, [reservations]);

    return { reservations, addReservation, updateReservationStatus, loading, error, refetch: fetchReservations };
};