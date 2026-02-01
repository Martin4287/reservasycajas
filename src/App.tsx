import React, { useMemo } from 'react';
import { useReservations } from './hooks/useReservations';
import ReservationForm from './components/ReservationForm';
import ReservationTable from './components/ReservationTable';
import { ReservationType, Reservation } from './types';
import { RestaurantIcon, LoadingSpinner } from './components/Icons';

// Helper to get local date in YYYY-MM-DD format
const getLocalDate = () => {
    const date = new Date();
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const { reservations, addReservation, updateReservationStatus, loading, error, refetch } = useReservations();

  const today = getLocalDate();

  // Memoize the filtering and sorting of reservations for performance.
  // This ensures the lists are only recalculated when the source data changes.
  const [todayLunchReservations, todayDinnerReservations, futureReservations] = useMemo(() => {
    const todayL: Reservation[] = [];
    const todayD: Reservation[] = [];
    const future: Reservation[] = [];

    // Filter and categorize reservations in a single loop for efficiency.
    // Past reservations (r.fecha < today) are implicitly and correctly ignored.
    for (const r of reservations) {
      if (r.fecha === today) {
        if (r.tipo === ReservationType.LUNCH) {
          todayL.push(r);
        } else if (r.tipo === ReservationType.DINNER) {
          todayD.push(r);
        }
      } else if (r.fecha > today) {
        future.push(r);
      }
    }
    
    // Sort the categorized arrays
    todayL.sort((a, b) => a.hora.localeCompare(b.hora));
    todayD.sort((a, b) => a.hora.localeCompare(b.hora));
    future.sort((a, b) => {
      if (a.fecha < b.fecha) return -1;
      if (a.fecha > b.fecha) return 1;
      return a.hora.localeCompare(b.hora);
    });

    return [todayL, todayD, future];
  }, [reservations, today]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
            <RestaurantIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
                Gestor de Reservas
            </h1>
        </div>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <ReservationForm onAddReservation={addReservation} isSubmitting={loading} />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button onClick={() => refetch()} className="ml-4 bg-red-700 text-white font-bold py-1 px-3 rounded hover:bg-red-800 transition-colors">
                Reintentar
              </button>
            </div>
          )}

          {loading && reservations.length === 0 && !error ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner className="w-12 h-12 text-indigo-600" />
              <p className="ml-4 text-lg text-gray-600">Cargando reservas...</p>
            </div>
          ) : (
            <div className="space-y-8 mt-8">
              <ReservationTable
                title="Reservas de Hoy - Almuerzo"
                reservations={todayLunchReservations}
                onUpdateStatus={updateReservationStatus}
              />
              <ReservationTable
                title="Reservas de Hoy - Cena"
                reservations={todayDinnerReservations}
                onUpdateStatus={updateReservationStatus}
              />
              <ReservationTable
                title="Reservas Futuras"
                reservations={futureReservations}
                isFuture={true}
                onUpdateStatus={updateReservationStatus}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Restaurant Reservations Manager - Powered by React, Tailwind CSS & Google Sheets</p>
      </footer>
    </div>
  );
};

export default App;