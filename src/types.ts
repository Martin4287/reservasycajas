export enum ReservationType {
    LUNCH = 'ALMUERZO',
    DINNER = 'CENA'
}

export interface Reservation {
    id: string;
    fecha: string; // YYYY-MM-DD
    nombre: string;
    habitacion: string;
    hora: string; // HH:MM
    cantidad: number;
    telefono: string;
    tipo: ReservationType;
    observacion: string;
    arrived: boolean;
}