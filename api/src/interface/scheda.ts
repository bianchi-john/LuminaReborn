export interface Scheda {
    id: number;
    titolo_opera: string;
    corpo_scheda: string;
    iscrizioni: string;
    descrizione_sintetica: string;
    storia_espositiva: string;
    classificazione: string;
    [key: string]: string | number;

}