export const QUERY = {
    SELECT_SCHEDE_PER_SCHEDATORE:`
      SELECT schede.*
      FROM users
      JOIN tds_users_schede ON users.id = tds_users_schede.id_user
      JOIN schede ON tds_users_schede.id_scheda = schede.id
      JOIN tds_schede_statoScheda ON schede.id = tds_schede_statoScheda.id_scheda
      JOIN statoScheda ON tds_schede_statoScheda.id_stato = statoScheda.id
      WHERE users.username = ? AND statoScheda.stato = 0;
      `,
    DELETE_SCHEDE_PER_SCHEDATORE:'DELETE FROM schede WHERE id = ?',
    SELECT_SCHEDE_PER_SCHEDATORE_IN_APPROVAZIONE:`
      SELECT schede.*
      FROM users
      JOIN tds_users_schede ON users.id = tds_users_schede.id_user
      JOIN schede ON tds_users_schede.id_scheda = schede.id
      JOIN tds_schede_statoScheda ON schede.id = tds_schede_statoScheda.id_scheda
      JOIN statoScheda ON tds_schede_statoScheda.id_stato = statoScheda.id
      WHERE users.username = ? AND statoScheda.stato = 1;
      `,
    SEND_SCHEDE_TO_SCHEDATORE: `UPDATE statoScheda AS ss JOIN tds_schede_statoScheda AS tss ON ss.id = tss.id_stato SET ss.stato = 1  WHERE tss.id_scheda = ?;`,
    WITHDRAW_SCHEDA: `UPDATE statoScheda AS ss JOIN tds_schede_statoScheda AS tss ON ss.id = tss.id_stato SET ss.stato = 0  WHERE tss.id_scheda = ?;`
};