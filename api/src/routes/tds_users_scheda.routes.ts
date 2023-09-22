import { Router } from 'express';
import { createTds_users_scheda, deleteTds_users_scheda, getTds_users_schede, getTds_users_scheda, updateTds_users_scheda } from '../controller/tds_users_scheda.controller';

const tds_users_schedaRoutes = Router();

tds_users_schedaRoutes.route('/')
  .get(getTds_users_schede)
  .post(createTds_users_scheda);

  tds_users_schedaRoutes.route('/:tds_users_schedaId')
  .get(getTds_users_scheda)
  .put(updateTds_users_scheda)
  .delete(deleteTds_users_scheda);

export default tds_users_schedaRoutes;
