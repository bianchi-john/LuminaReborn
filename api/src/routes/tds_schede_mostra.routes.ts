import { Router } from 'express';
import { createTds_schede_mostra, deleteTds_schede_mostra, getTds_schede_mostra, getTds_schede_mostre, updateTds_schede_mostra } from '../controller/tds_schede_mostra.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_mostre)
  .post(createTds_schede_mostra);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_mostra)
  .put(updateTds_schede_mostra)
  .delete(deleteTds_schede_mostra);

export default misuraRoutes;
