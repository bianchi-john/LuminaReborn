export interface Mostra {
    id: number;
    curatore: number;
    titolo_mostra: string;
    giorno_data_da: number | null;
    mese_data_da: number | null;
    anno_data_da: number | null;
    giorno_data_a: number | null;
    mese_data_a: number | null;
    anno_data_a: number | null;
    luogo_mostra: number | null;
    descrizione: string;
}