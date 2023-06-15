"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICHE: 'SELECT * FROM tds_schede_documentazioniFotografiche',
    SELECT_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA: 'SELECT * FROM tds_schede_documentazioniFotografiche WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA: 'INSERT INTO tds_schede_documentazioniFotografiche(id_scheda, id_documentazioneFotografica ) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA: 'UPDATE tds_schede_documentazioniFotografiche SET id_scheda = ?, id_documentazioneFotografica = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA: 'DELETE FROM tds_schede_documentazioniFotografiche WHERE id_scheda = ?',
};
