import React from 'react';
import type { Reservation } from '../types';

interface ReservationTableProps {
  title: string;
  reservations: Reservation[];
  isFuture?: boolean;
  onUpdateStatus: (id: string, arrived: boolean) => void;
}

const ReservationRow: React.FC<{
    reservation: Reservation;
    isFuture?: boolean;
    onUpdateStatus: (id: string, arrived: boolean) => void;
}> = ({ reservation, isFuture, onUpdateStatus }) => {
    
    // Create a Date object by parsing the date and time in the browser's local timezone.
    // This now works reliably because `reservation.fecha` and `reservation.hora` are clean strings.
    const reservationDateTime = new Date(`${reservation.fecha}T${reservation.hora}`);
    const isInvalidDate = isNaN(reservationDateTime.getTime());

    let rowClass = 'bg-white hover:bg-gray-50';
    const now = new Date();
    
    if (!isFuture && !isInvalidDate) {
        const diffMinutes = (now.getTime() - reservationDateTime.getTime()) / 60000;

        if (reservation.arrived) {
            rowClass = 'bg-green-100 text-green-800';
        } else if (diffMinutes > 15) {
            rowClass = 'bg-red-200 text-red-900';
        } else if (diffMinutes > 10) {
            rowClass = 'bg-yellow-100 text-yellow-900';
        }
    } else if (reservation.arrived) {
         rowClass = 'bg-green-100 text-green-800';
    }

    // Displaying the time is now simple, as the string is already correct.
    const displayTime = reservation.hora;

    return (
        <tr className={`${rowClass} border-b border-gray-200 transition-colors duration-300`}>
            {isFuture && <td className="px-5 py-4 whitespace-nowrap">{reservation.fecha}</td>}
            <td className="px-5 py-4 whitespace-nowrap font-medium">{reservation.nombre}</td>
            <td className="px-5 py-4 whitespace-nowrap">{reservation.habitacion}</td>
            <td className="px-5 py-4 whitespace-nowrap">{displayTime}</td>
            <td className="px-5 py-4 whitespace-nowrap text-center">{reservation.cantidad}</td>
            <td className="px-5 py-4 whitespace-nowrap">{reservation.telefono}</td>
            {isFuture && <td className="px-5 py-4 whitespace-nowrap">{reservation.tipo}</td>}
            <td className="px-5 py-4">{reservation.observacion}</td>
            <td className="px-5 py-4 text-center">
                <input 
                    type="checkbox" 
                    checked={reservation.arrived}
                    onChange={(e) => onUpdateStatus(reservation.id, e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
            </td>
        </tr>
    );
};


const ReservationTable: React.FC<ReservationTableProps> = ({ title, reservations, isFuture = false, onUpdateStatus }) => {
  const futureHeaders = ['Fecha', 'Nombre', 'Habitación', 'Hora', 'Cant.', 'Teléfono', 'Tipo', 'Observación', 'Llegó'];
  const todayHeaders = ['Nombre', 'Habitación', 'Hora', 'Cant.', 'Teléfono', 'Observación', 'Llegó'];
  const headers = isFuture ? futureHeaders : todayHeaders;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase tracking-wider">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-5 py-3 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
                reservations.map(res => (
                    <ReservationRow key={res.id} reservation={res} isFuture={isFuture} onUpdateStatus={onUpdateStatus} />
                ))
            ) : (
                <tr>
                    <td colSpan={headers.length} className="text-center py-10 px-5 text-gray-500">
                        No hay reservas para mostrar.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationTable;