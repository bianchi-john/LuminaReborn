export const ADMINQUERY = {
  SELECT_BOZZE_PER_SCHEDATORE: `
      SELECT schede.*
      FROM users
      JOIN tds_users_schede ON users.id = tds_users_schede.id_user
      JOIN schede ON tds_users_schede.id_scheda = schede.id
      JOIN tds_schede_statoScheda ON schede.id = tds_schede_statoScheda.id_scheda
      JOIN statoScheda ON tds_schede_statoScheda.id_stato = statoScheda.id
      WHERE statoScheda.stato = 1;
      `,
    APPROVE_BOZZA:`UPDATE statoScheda AS ss JOIN tds_schede_statoScheda AS tss ON ss.id = tss.id_stato SET ss.stato = 2 WHERE tss.id_scheda = ?;`,
    REJECT_BOZZA:`UPDATE statoScheda AS ss JOIN tds_schede_statoScheda AS tss ON ss.id = tss.id_stato SET ss.stato = 0 WHERE tss.id_scheda = ?;`
  };
  