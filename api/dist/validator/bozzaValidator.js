"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchedaData = void 0;
const promise_1 = require("mysql2/promise");
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
const validateSchedaData = (schedaData) => __awaiter(void 0, void 0, void 0, function* () {
    // Controllo SQL injection
    for (const key in schedaData) {
        if (Object.prototype.hasOwnProperty.call(schedaData, key) && typeof schedaData[key] === 'string') {
            const escapedValue = yield (0, promise_1.escape)(schedaData[key]);
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
});
exports.validateSchedaData = validateSchedaData;
