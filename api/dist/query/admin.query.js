"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_BOZZE_PER_SCHEDATORE: `
      SELECT schede.*
      FROM users
      JOIN tds_users_schede ON users.id = tds_users_schede.id_user
      JOIN schede ON tds_users_schede.id_scheda = schede.id
      JOIN tds_schede_statoScheda ON schede.id = tds_schede_statoScheda.id_scheda
      JOIN statoScheda ON tds_schede_statoScheda.id_stato = statoScheda.id
      WHERE statoScheda.stato = 1;
      `
};
