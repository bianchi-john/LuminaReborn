import { Router } from 'express';
import { createTds_schede_autore, deleteTds_schede_autore, getTds_schede_autore, getTds_schede_autori, updateTds_schede_autore } from '../controller/tds_schede_autore.controller';

const tds_schede_autoreRoutes = Router();

tds_schede_autoreRoutes.route('/')
  .get(getTds_schede_autori)
  .post(createTds_schede_autore);

  tds_schede_autoreRoutes.route('/:tds_schede_autoreId')
  .get(getTds_schede_autore)
  .put(updateTds_schede_autore)
  .delete(deleteTds_schede_autore);

export default tds_schede_autoreRoutes;
