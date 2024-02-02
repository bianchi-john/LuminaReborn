import { escape } from 'mysql2/promise';

// your-validation-module.ts
export interface YourValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

const allowedKeys = [
  "Formula_precedente",
  "Formula_successiva",
  "Categoria",
  "NomeAutore",
  "AutorePreesistente",
  "Materiale",
  "MaterialePreesistente",
  "Tecnica",
  "TencicaPreesistente",
  "TitoloMisure",
  "InteroParziale",
  "Direzione",
  "Tipo",
  "Valore",
  "Unita",
  "Provenienza",
  "DescrizioneProvenienza",
  "NoteProvenienza",
  "iscrizioni",
  "storia_espositiva",
  "descrizione_sintetica",
  "corpo_scheda",
  "TitoloMostra",
  "Curatore",
  "GiornoInizioMostra",
  "MeseInizioMostra",
  "AnnoInizioMostra",
  "GiornoFineMostra",
  "MeseFineMostra",
  "AnnoFineMostra",
  "LuogoMostra",
  "DescrizioneMostra",
  "bibliografia",
  "altraBibliografia",
  "Didascalia",
  "Immagine",
  "titolo_opera",
  "copertina",
  "etichetta_data",
  "giorno_data_da",
  "mese_data_da",
  "anno_data_da",
  "giorno_data_a",
  "mese_data_a",
  "anno_data_a",
  "ambito",
  "ubicazione",
  "descrizione",
  "inventario",
  "giuridica",
  "classificazione",
  "commento"
];



export const validateSchedaData = async (schedaData: any): Promise<YourValidationResult> => {
  // Controllo SQL injection
  for (const key in schedaData) {
    if (Object.prototype.hasOwnProperty.call(schedaData, key) && typeof schedaData[key] === 'string') {
      const escapedValue = await escape(schedaData[key]);
      if (escapedValue.slice(1, -1) !== schedaData[key]) {
        return { isValid: false, errorMessage: `Potenziale attacco SQL injection rilevato nel campo ${key}` };
      }
    }
  }
    // Controllo che le chiavi siano tra quelle consentite
    for (const key in schedaData) {
      if (!allowedKeys.includes(key)) {
        return { isValid: false, errorMessage: `La chiave ${key} non è consentita` };
      }
    }
  

  // Verifica la presenza e il tipo di "titolo_opera"
  if (!schedaData.titolo_opera || typeof schedaData.titolo_opera !== 'string' || schedaData.titolo_opera === '') {
    return { isValid: false, errorMessage: 'Il titolo opera è necessario e deve essere una stringa' };
  }

  // Controllo che le chiavi che iniziano con "Valore" contengano numeri o float
  for (const key in schedaData) {
    if (key.startsWith('Valore')) {
      const value = schedaData[key];
      if (isNaN(parseFloat(value))) {
        return { isValid: false, errorMessage: `Il campo ${key} deve contenere un numero o float` };
      }
    }
  }
  
  

  // Se tutti i controlli passano, restituisci un oggetto di validazione valido
  return { isValid: true };
};
