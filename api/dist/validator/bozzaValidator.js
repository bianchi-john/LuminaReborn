"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchedaData = void 0;
const validateSchedaData = (schedaData) => {
    // Esegui i controlli di validazione sui dati
    // Verifica la presenza e il tipo di "titolo_opera"
    if (!schedaData.titolo_opera || typeof schedaData.titolo_opera !== 'string' || schedaData.titolo_opera == '') {
        return { isValid: false, errorMessage: 'Il titolo opera è necessario e deve essere una stringa' };
    }
    // Altri controlli di sicurezza e validazione...
    // Se tutti i controlli passano, restituisci un oggetto di validazione valido
    return { isValid: true };
};
exports.validateSchedaData = validateSchedaData;
