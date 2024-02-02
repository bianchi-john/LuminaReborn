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
      if (!allowedKeys.some(allowedKey => key.includes(allowedKey))) {
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
    
// Funzione per verificare la validità di un insieme di date
const isValidDateSet = (baseKey: string, data: any): boolean => {
  const isValidDate = (day: string, month: string, year: string): boolean => {
    const numericDay = parseInt(day, 10);
    const numericMonth = parseInt(month, 10);
    const numericYear = parseInt(year, 10);

    if (isNaN(numericDay) || isNaN(numericMonth) || isNaN(numericYear)) {
      return false; // Uno dei valori non è numerico
    }

    // Verifica se la data è valida
    const date = new Date(numericYear, numericMonth - 1, numericDay);
    return (
      date.getFullYear() === numericYear &&
      date.getMonth() === numericMonth - 1 &&
      date.getDate() === numericDay &&
      date.getFullYear() >= -9999 // Anno minimo consentito (considerando date avanti cristo)
    );
  };

    for (let i = 1; i <= 2; i++) { // Puoi modificare questo range in base al numero massimo di insiemi di date consentiti
      const keyPrefix = `${baseKey}${i}`;
      const dayKey = `${keyPrefix}GiornoInizioMostra`;
      const monthKey = `${keyPrefix}MeseInizioMostra`;
      const yearKey = `${keyPrefix}AnnoInizioMostra`;

      if (data[dayKey] || data[monthKey] || data[yearKey]) {
        // Se almeno uno dei valori è presente, verifica la validità della data
        const isValidStartDate = isValidDate(data[dayKey], data[monthKey], data[yearKey]);

        if (!isValidStartDate) {
          return false;
        }
      }

      // Fai lo stesso per la data di fine
      const dayEndKey = `${keyPrefix}GiornoFineMostra`;
      const monthEndKey = `${keyPrefix}MeseFineMostra`;
      const yearEndKey = `${keyPrefix}AnnoFineMostra`;

      if (data[dayEndKey] || data[monthEndKey] || data[yearEndKey]) {
        const isValidEndDate = isValidDate(data[dayEndKey], data[monthEndKey], data[yearEndKey]);

        if (!isValidEndDate) {
          return false;
        }
      }
    }

    return true;
  };

  // Verifica la validità delle date di inizio e fine di mostre dinamiche
  const isMostraDateSetValid = isValidDateSet('GiornoInizioMostra', schedaData);

  if (!isMostraDateSetValid) {
    return { isValid: false, errorMessage: 'Una delle date di inizio o fine mostra non è valida' };
  }


  // Se tutti i controlli passano, restituisci un oggetto di validazione valido
  return { isValid: true };
};
