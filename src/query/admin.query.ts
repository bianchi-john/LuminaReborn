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
    APPROVE_BOZZA:`UPDATE statoScheda AS ss JOIN tds_schede_statoScheda AS tss ON ss.id = tss.id_stato SET ss.stato = 2 WHERE tss.id_scheda = ? AND ss.stato = 1;`,
    REJECT_BOZZA:`UPDATE statoScheda AS ss JOIN tds_schede_statoScheda AS tss ON ss.id = tss.id_stato SET ss.stato = 0 WHERE tss.id_scheda = ? AND ss.stato = 1;`,
    // Schede pubblicate (stato 2), con chi le ha scritte, dalla più recente
    SELECT_SCHEDE_PUBBLICATE: `
      SELECT schede.id, schede.titolo_opera, users.username AS schedatore
      FROM schede
      JOIN tds_schede_statoScheda ON schede.id = tds_schede_statoScheda.id_scheda
      JOIN statoScheda ON tds_schede_statoScheda.id_stato = statoScheda.id
      LEFT JOIN tds_users_schede ON tds_users_schede.id_scheda = schede.id
      LEFT JOIN users ON users.id = tds_users_schede.id_user
      WHERE statoScheda.stato = 2
      ORDER BY schede.id DESC;
      `,
    STATO_SCHEDA: `
      SELECT statoScheda.stato
      FROM tds_schede_statoScheda
      JOIN statoScheda ON statoScheda.id = tds_schede_statoScheda.id_stato
      WHERE tds_schede_statoScheda.id_scheda = ?
      LIMIT 1;
      `
  };
  