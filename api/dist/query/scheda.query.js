"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_SCHEDE: 'SELECT * FROM schede',
    SELECT_SCHEDA: 'SELECT * FROM schede WHERE id = ?',
    SELECT_AUTORI: 'SELECT * FROM autori JOIN tds_schede_autori ON autori.id = tds_schede_autori.id_autore  WHERE tds_schede_autori.id_scheda = ?',
    SELECT_CRONOLOGIE: 'SELECT * FROM cronologie JOIN tds_schede_cronologie ON cronologie.id = tds_schede_cronologie.id_cronologia WHERE tds_schede_cronologie.id_scheda = ?',
    SELECT_MATERIALI: 'SELECT * FROM materiali JOIN tds_schede_materiali ON materiali.id = tds_schede_materiali.id_materiale WHERE tds_schede_materiali.id_scheda =  ?',
    SELECT_TECNICHE: 'SELECT * FROM tecniche JOIN tds_schede_tecniche ON tecniche.id = tds_schede_tecniche.id_tecnica WHERE tds_schede_tecniche.id_scheda =  ?',
    SELECT_UBICAZIONI: 'SELECT * FROM ubicazioni JOIN tds_schede_ubicazioni ON ubicazioni.id = tds_schede_ubicazioni.id_ubicazione WHERE tds_schede_ubicazioni.id_scheda =  ?',
    SELECT_INVENTARI: 'SELECT * FROM inventari JOIN tds_schede_inventari ON inventari.id = tds_schede_inventari.id_inventario WHERE tds_schede_inventari.id_scheda =  ?',
    SELECT_PROVENIENZE: 'SELECT * FROM provenienze JOIN tds_schede_provenienze ON provenienze.id = tds_schede_provenienze.id_provenienza WHERE tds_schede_provenienze.id_scheda =  ?',
    SELECT_MOSTRE: 'SELECT * FROM mostre JOIN tds_schede_mostre ON mostre.id = tds_schede_mostre.id_mostra WHERE tds_schede_mostre.id_scheda =  ?',
    SELECT_BIBLIOGRAFIE: 'SELECT * FROM bibliografie  JOIN tds_schede_bibliografie ON bibliografie.id = tds_schede_bibliografie.id_bibliografia WHERE tds_schede_bibliografie.id_scheda =  ?',
    SELECT_ALTREBIBLIOGRAFIE: 'SELECT * FROM altreBibliografie  JOIN tds_schede_altreBibliografie ON altreBibliografie.id = tds_schede_altreBibliografie.id_altreBibliografie WHERE tds_schede_altreBibliografie.id_scheda =  ?',
    SELECT_IMMAGINI: 'SELECT * FROM immagini JOIN tds_schede_immagini ON immagini.id = tds_schede_immagini.id_immagine WHERE tds_schede_immagini.id_scheda =  ?',
    SELECT_DOCUMENTAZIONIFOTOGRAFICHE: 'SELECT * FROM documentazioniFotografiche JOIN tds_schede_documentazioniFotografiche ON documentazioniFotografiche.id = tds_schede_documentazioniFotografiche.id_documentazioneFotografica WHERE tds_schede_documentazioniFotografiche.id_scheda =  ?',
    SELECT_MISURE: 'SELECT m.*, tsgm.* FROM misure AS m JOIN tds_schede_gruppo_misure AS tsgm ON m.id_gruppo_misure = tsgm.id JOIN tds_schede_misure AS tsm ON tsgm.id = tsm.id_gruppo_misure WHERE tsm.id_scheda = ?',
    SELECT_SCHEDATORI: 'SELECT * FROM users JOIN tds_users_schede ON users.id = tds_users_schede.id_user WHERE tds_users_schede.id_scheda = ?',
    UPDATE_SCHEDA: 'UPDATE schede SET id = ?, titolo_opera = ?,  corpo_scheda = ?, iscrizioni = ?, descrizione_sintetica = ?, storia_espositiva = ?, classificazione = ? WHERE id = ?',
    DELETE_SCHEDA: 'DELETE FROM schede WHERE id = ?',
    CREATE_SCHEDA: (schedaData) => {
        const fields = [
            'titolo_opera', 'corpo_scheda', 'iscrizioni',
            'descrizione_sintetica', 'storia_espositiva', 'classificazione'
        ];
        const values = fields.map(field => schedaData[field]);
        const placeholders = fields.map(() => '?');
        const query = `
          INSERT INTO schede (${fields.join(', ')})
          VALUES (${placeholders.join(', ')});
        `;
        return {
            query,
            values,
        };
    },
    CREATE_SCHEDA_AUTORI: (schedaId, autoriData) => {
        const autoriQueries = [];
        const tdsSchedeAutoriQueries = [];
        const autoriValues = [];
        for (let i = 1; i <= 10; i++) {
            const formulaPrecedente = autoriData[`Formula_precedente${i}`];
            const formulaSuccessiva = autoriData[`Formula_successiva${i}`];
            const categoria = autoriData[`Categoria${i}`];
            const nome = autoriData[`NomeAutore${i}`];
            const autorePreesistente = autoriData[`AutorePreesistente${i}`];
            if (formulaPrecedente || formulaSuccessiva || categoria || nome || autorePreesistente) {
                autoriValues.push(formulaPrecedente, formulaSuccessiva, categoria, nome);
                autoriQueries.push(`
            INSERT INTO autori (formula_precedente, formula_successiva, categoria, nome)
            VALUES (?, ?, ?, ?);
        `);
                tdsSchedeAutoriQueries.push(`
            INSERT INTO tds_schede_autori (id_scheda, id_autore)
            VALUES (?, LAST_INSERT_ID());
        `);
            }
        }
        const finalAutoreQuery = autoriQueries.join('\n');
        const finalTdsSchedeAutoriQuery = tdsSchedeAutoriQueries.join('\n');
        const finalQuery = `
        START TRANSACTION;

        ${finalAutoreQuery}

        ${finalTdsSchedeAutoriQuery}

        COMMIT;
    `;
        return {
            query: finalQuery,
            values: [schedaId, ...autoriValues],
        };
    },
    CREATE_SCHEDA_MATERIALE: '',
    CREATE_SCHEDA_TECNICA: '',
};
