import React, { useState, FormEvent } from 'react';
import type { Reservation } from '../types';
import { ReservationType } from '../types';
import { PlusIcon, CheckCircleIcon, LoadingSpinner } from './Icons';

interface ReservationFormProps {
  onAddReservation: (reservation: Omit<Reservation, 'id' | 'arrived'>) => Promise<void>;
  isSubmitting: boolean;
}

// Helper to get local date in YYYY-MM-DD format
const getLocalDate = () => {
    const date = new Date();
    // Adjust for timezone offset to get the correct local date
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().split('T')[0];
};

const ReservationForm: React.FC<ReservationFormProps> = ({ onAddReservation, isSubmitting }) => {
  const [nombre, setNombre] = useState('');
  const [habitacion, setHabitacion] = useState('');
  const [fecha, setFecha] = useState(getLocalDate());
  const [hora, setHora] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [telefono, setTelefono] = useState('');
  const [tipo, setTipo] = useState<ReservationType | ''>('');
  const [observacion, setObservacion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tipo) {
      alert('Por favor, selecciona un tipo de reserva.');
      return;
    }

    try {
        await onAddReservation({
            nombre,
            habitacion,
            fecha,
            hora,
            cantidad,
            telefono,
            tipo,
            observacion
        });
        
        // Clear form only on successful submission
        setNombre('');
        setHabitacion('');
        setFecha(getLocalDate());
        setHora('');
        setCantidad(1);
        setTelefono('');
        setTipo('');
        setObservacion('');

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
        // Error is handled globally by the useReservations hook.
        // We catch it here to prevent the form from being cleared on failure.
        console.error("Submission failed, form data preserved.", error);
    }
  };

  const formFieldClasses = "block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out";

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 relative">
       {showSuccess && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-green-500 text-white rounded-t-xl flex items-center justify-center transition-opacity duration-300">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            <span>¡La reserva se cargó con éxito!</span>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservar Mesa</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" required className={formFieldClasses} />
        <input type="text" value={habitacion} onChange={e => setHabitacion(e.target.value)} placeholder="Habitación" className={formFieldClasses} />
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required className={formFieldClasses} style={{ colorScheme: 'light' }} />
        <input type="time" value={hora} onChange={e => setHora(e.target.value)} required className={formFieldClasses} />
        <input type="number" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value, 10))} placeholder="Cantidad" min="1" required className={formFieldClasses} />
        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} pattern="\d{3}-\d{7}" placeholder="Teléfono (XXX-XXXXXXX)" className={formFieldClasses} />
        
        <select value={tipo} onChange={e => setTipo(e.target.value as ReservationType)} required className={formFieldClasses}>
          <option value="" disabled>-- Selecciona Tipo --</option>
          <option value={ReservationType.LUNCH}>Almuerzo</option>
          <option value={ReservationType.DINNER}>Cena</option>
        </select>
        
        <textarea value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Observaciones" className={`${formFieldClasses} md:col-span-2`}></textarea>
        
        <button type="submit" disabled={isSubmitting} className="md:col-span-2 w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <>
              <LoadingSpinner className="w-5 h-5 mr-3" />
              Agregando...
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5 mr-2" />
              Agregar Reserva
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;