import { Router } from 'express';
import { createTds_schede_mostra, deleteTds_schede_mostra, getTds_schede_mostra, getTds_schede_mostre, updateTds_schede_mostra } from '../controller/tds_schede_mostra.controller';

const tds_schede_mostraRoutes = Router();

tds_schede_mostraRoutes.route('/')
  .get(getTds_schede_mostre)
  .post(createTds_schede_mostra);

  tds_schede_mostraRoutes.route('/:tds_schede_mostraId')
  .get(getTds_schede_mostra)
  .put(updateTds_schede_mostra)
  .delete(deleteTds_schede_mostra);

export default tds_schede_mostraRoutes;
