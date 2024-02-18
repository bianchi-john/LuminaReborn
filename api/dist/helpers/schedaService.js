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
exports.insertImaagini = exports.insertUser = exports.insertMisure = exports.insertDocFotografica = exports.insertAltraBibliografia = exports.insertBibliografia = exports.insertMostre = exports.insertProvenienze = exports.insertTecniche = exports.insertMateriali = exports.insertInventario = exports.insertUbicazioni = exports.insertCronologie = exports.insertAutori = exports.insertScheda = void 0;
const scheda_query_1 = require("../query/scheda.query");
const mysql_config_1 = require("../config/mysql.config");
// schedaService.ts
function insertScheda(scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield (0, mysql_config_1.connection)();
            // Inserisci la scheda
            const resultScheda = yield pool.query(scheda_query_1.QUERY.INSERT_SCHEDA, [
                scheda.titolo_opera,
                scheda.corpo_scheda || '',
                scheda.iscrizioni || '',
                scheda.descrizione_sintetica || '',
                scheda.storia_espositiva || '',
                scheda.classificazione || '',
            ]);
            return resultScheda[0].insertId;
        }
        catch (error) {
            console.error('Errore durante l\'inserimento della scheda:', error);
            throw new Error('Errore durante l\'inserimento della scheda');
        }
    });
}
exports.insertScheda = insertScheda;
function insertAutori(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`NomeAutore${i}`] ||
                    scheda[`Formula_precedente${i}`] ||
                    scheda[`Formula_successiva${i}`] ||
                    scheda[`Categoria${i}`] ||
                    scheda[`NomeAutore${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_AUTORE, [
                        scheda[`Formula_precedente${i}`] || '',
                        scheda[`Formula_successiva${i}`] || '',
                        scheda[`Categoria${i}`] || '',
                        scheda[`NomeAutore${i}`] || '',
                    ]);
                    const thisId = result[0].insertId;
                    // Collega  la scheda con la funzione tds
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_AUTORI, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento degli autori:', error);
            throw new Error('Errore durante l\'inserimento degli autori');
        }
    });
}
exports.insertAutori = insertAutori;
// Cronologie
function insertCronologie(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            if (scheda.ambito_storico ||
                scheda.etichetta_data ||
                scheda.anno_data_a ||
                scheda.anno_data_da ||
                scheda.giorno_data_a ||
                scheda.giorno_data_da ||
                scheda.mese_data_a ||
                scheda.mese_data_da) {
                const result = yield pool.query(scheda_query_1.QUERY.INSERT_CONOLOGIA, [
                    scheda.ambito_storico || '',
                    scheda.etichetta_data || '',
                    scheda.giorno_data_da || '',
                    scheda.mese_data_da || '',
                    scheda.anno_data_da || '',
                    scheda.giorno_data_a || '',
                    scheda.mese_data_a || '',
                    scheda.anno_data_a || ''
                ]);
                const thisId = result[0].insertId;
                // Collega  la scheda con la funzione tds
                promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_CONOLOGIA, [schedaId, thisId]));
            }
            yield Promise.all(promises);
        }
        catch (error) {
            console.error('Errore durante l\'inserimento delle cronologie:', error);
            throw new Error('Errore durante l\'inserimento degli cronologie');
        }
    });
}
exports.insertCronologie = insertCronologie;
// Ubicazioni
function insertUbicazioni(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            if (scheda.ubicazione ||
                scheda.descrizione) {
                const result = yield pool.query(scheda_query_1.QUERY.INSERT_UBICAZIONE, [
                    scheda.ubicazione || '',
                    scheda.descrizione || ''
                ]);
                const thisId = result[0].insertId;
                // Collega  la scheda con la funzione tds
                promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_UBICAZIONE, [schedaId, thisId]));
            }
            yield Promise.all(promises);
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di ubicazioni:', error);
            throw new Error('Errore durante l\'inserimento di ubicazioni');
        }
    });
}
exports.insertUbicazioni = insertUbicazioni;
// Inventario
function insertInventario(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            if (scheda.inventario ||
                scheda.giuridica) {
                const result = yield pool.query(scheda_query_1.QUERY.INSERT_INVENTARIO, [
                    scheda.inventario || '',
                    scheda.giuridica || ''
                ]);
                const thisId = result[0].insertId;
                // Collega  la scheda con la funzione tds
                promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_INVENTARIO, [schedaId, thisId]));
            }
            yield Promise.all(promises);
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di Inventario:', error);
            throw new Error('Errore durante l\'inserimento di Inventario');
        }
    });
}
exports.insertInventario = insertInventario;
// Materiali
function insertMateriali(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`Materiale${i}`] ||
                    scheda[`MaterialePreesistente${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_MATERIALE, [
                        scheda[`Materiale${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_MATERIALE, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento Materiali:', error);
            throw new Error('Errore durante l\'inserimento Materiali');
        }
    });
}
exports.insertMateriali = insertMateriali;
// Tecniche
function insertTecniche(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`Tecnica${i}`] ||
                    scheda[`TencicaPreesistente${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_TECNICA, [
                        scheda[`Tecnica${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_TECNICA, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di tecniche:', error);
            throw new Error('Errore durante l\'inserimento di tecniche');
        }
    });
}
exports.insertTecniche = insertTecniche;
// Provenienze
function insertProvenienze(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`Provenienza${i}`] ||
                    scheda[`DescrizioneProvenienza${i}`] ||
                    scheda[`NoteProvenienza${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_PROVENIENZA, [
                        scheda[`Provenienza${i}`] || '',
                        scheda[`DescrizioneProvenienza${i}`] || '',
                        scheda[`NoteProvenienza${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_PROVENIENZA, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di Provenienze:', error);
            throw new Error('Errore durante l\'inserimento di Provenienze');
        }
    });
}
exports.insertProvenienze = insertProvenienze;
// Mostre
function insertMostre(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`Curatore${i}`] ||
                    scheda[`TitoloMostra${i}`] ||
                    scheda[`GiornoInizioMostra${i}`] ||
                    scheda[`MeseInizioMostra${i}`] ||
                    scheda[`AnnoInizioMostra${i}`] ||
                    scheda[`GiornoFineMostra${i}`] ||
                    scheda[`MeseFineMostra${i}`] ||
                    scheda[`AnnoFineMostra${i}`] ||
                    scheda[`LuogoMostra${i}`] ||
                    scheda[`DescrizioneMostra${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_PROVENIENZA, [
                        scheda[`Curatore${i}`] || '',
                        scheda[`TitoloMostra${i}`] || '',
                        scheda[`GiornoInizioMostra${i}`] || '',
                        scheda[`MeseInizioMostra${i}`] || '',
                        scheda[`AnnoInizioMostra${i}`] || '',
                        scheda[`GiornoFineMostra${i}`] || '',
                        scheda[`MeseFineMostra${i}`] || '',
                        scheda[`AnnoFineMostra${i}`] || '',
                        scheda[`LuogoMostra${i}`] || '',
                        scheda[`DescrizioneMostra${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_PROVENIENZA, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di Mostre:', error);
            throw new Error('Errore durante l\'inserimento di Mostre');
        }
    });
}
exports.insertMostre = insertMostre;
// Bibliografia
function insertBibliografia(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`riferimento_bibliografico${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_BIBILIOGRAFIA, [
                        scheda[`riferimento_bibliografico${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_BIBILIOGRAFIA, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di Bibliografia:', error);
            throw new Error('Errore durante l\'inserimento di Bibliografia');
        }
    });
}
exports.insertBibliografia = insertBibliografia;
// AltraBibliografia
function insertAltraBibliografia(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`riferimento_bibliografico${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_ALTRABIBILIOGRAFIA, [
                        scheda[`riferimento_bibliografico${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_ALTRABIBILIOGRAFIA, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di AltraBibliografia:', error);
            throw new Error('Errore durante l\'inserimento di AltraBibliografia');
        }
    });
}
exports.insertAltraBibliografia = insertAltraBibliografia;
// DocFotografica
function insertDocFotografica(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`documentazioneFotograficaInput${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_FOTOGRAFICA, [
                        scheda[`documentazioneFotograficaInput${i}`] || ''
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_FOTOGRAFICA, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di DocFotografica:', error);
            throw new Error('Errore durante l\'inserimento di DocFotografica');
        }
    });
}
exports.insertDocFotografica = insertDocFotografica;
function insertMisure(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        const gruppiMisurePromises = [];
        for (let i = 1;; i++) {
            const titoloMisureKey = `TitoloMisure${i}`;
            const interoParzialeKey = `InteroParziale${i}`;
            if (scheda[titoloMisureKey] || scheda[interoParzialeKey]) {
                const resultGruppoMisure = yield pool.query(scheda_query_1.QUERY.INSERT_GRUPPO_MISURE, [
                    scheda[interoParzialeKey] || '',
                    scheda[titoloMisureKey] || '',
                ]);
                const gruppoMisureId = resultGruppoMisure[0].insertId;
                // Collega il gruppo di misure alla scheda nella tabella tds_schede_misure
                gruppiMisurePromises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_MISURE, [schedaId, gruppoMisureId]));
                for (let j = 1;; j++) {
                    const direzioneKey = `Direzione${i}${j}`;
                    const tipoKey = `Tipo${i}${j}`;
                    const valoreKey = `Valore${i}${j}`;
                    const unitaKey = `Unita${i}${j}`;
                    if (scheda[direzioneKey] || scheda[tipoKey] || scheda[valoreKey] || scheda[unitaKey]) {
                        const resultMisure = yield pool.query(scheda_query_1.QUERY.INSERT_MISURE, [
                            scheda[direzioneKey] || '',
                            scheda[tipoKey] || '',
                            scheda[valoreKey] || '',
                            scheda[unitaKey] || '',
                            gruppoMisureId,
                        ]);
                    }
                    else {
                        // Se nessuna delle chiavi è presente, esce dal ciclo interno
                        break;
                    }
                }
            }
            else {
                // Se nessuna delle chiavi è presente, esce dal ciclo esterno
                break;
            }
        }
    });
}
exports.insertMisure = insertMisure;
function insertUser(pool, schedaId, scheda, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            // Verifica se lo user esiste già
            const userExistsQuery = `SELECT username FROM users WHERE username = ?;`;
            const [userExistsResult] = yield pool.query(userExistsQuery, [userData.username]);
            let userId;
            if (userExistsResult.length > 0) {
                // Lo user esiste già, prendi l'id
                const userExistsQuery = `SELECT id FROM users WHERE username = ?;`;
                const [userExistsResult] = yield pool.query(userExistsQuery, [userData.username]);
                userId = userExistsResult[0].id;
                console.log(`Lo user l'id ${userData.username} esiste già. ID: ${userExistsResult[0].id}`);
            }
            else {
                const firstResult = yield pool.query(scheda_query_1.QUERY.INSERT_USER, [userData.isAdmin, userData.username, userData.display_name]);
                userId = firstResult[0].insertId;
            }
            const secondResult = yield pool.query(scheda_query_1.QUERY.INSERT_STATOSCHEDA, [0, scheda.commento || '']);
            const statoSchedaID = secondResult[0].insertId;
            // Collega la scheda con la funzione tds
            promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDE_STATOSCHEDA, [schedaId, statoSchedaID]));
            promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_STATO_SCHEDAUSER, [statoSchedaID, userId]));
            promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_USER_SCHEDA, [userId, schedaId, new Date()]));
            yield Promise.all(promises);
        }
        catch (error) {
            console.error('Errore durante l\'inserimento di user:', error);
            throw new Error('Errore durante l\'inserimento di user');
        }
    });
}
exports.insertUser = insertUser;
// Immagini
function insertImaagini(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = [];
            let atLeastOneKeyPresent = false;
            for (let i = 1;; i++) {
                if (scheda[`immagine${i}`] ||
                    scheda[`didascalia_immagine${i}`]) {
                    atLeastOneKeyPresent = true; // almeno una chiave è presente
                    const result = yield pool.query(scheda_query_1.QUERY.INSERT_IMMAGINI, [
                        scheda[`immagine${i}`] || '', scheda[`didascalia_immagine`] || '',
                    ]);
                    const thisId = result[0].insertId;
                    promises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_IMMAGINI, [schedaId, thisId]));
                }
                else {
                    // Se nessuna delle chiavi è presente, esce dal ciclo
                    break;
                }
            }
            if (atLeastOneKeyPresent) {
                yield Promise.all(promises);
            }
        }
        catch (error) {
            console.error('Errore durante l\'inserimento immagini:', error);
            throw new Error('Errore durante l\'inserimento immagini');
        }
    });
}
exports.insertImaagini = insertImaagini;
