import { Router } from 'express';
import { createTds_schede_materiale, deleteTds_schede_materiale, getTds_schede_materiale, getTds_schede_materiali, updateTds_schede_materiale } from '../controller/tds_schede_materiale.controller';

const tds_schede_materialeRoutes = Router();

tds_schede_materialeRoutes.route('/')
  .get(getTds_schede_materiali)
  .post(createTds_schede_materiale);

  tds_schede_materialeRoutes.route('/:tds_schede_materialeId')
  .get(getTds_schede_materiale)
  .put(updateTds_schede_materiale)
  .delete(deleteTds_schede_materiale);

export default tds_schede_materialeRoutes;
