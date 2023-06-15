import { Router } from 'express';
import { createTds_schede_cronologia, deleteTds_schede_cronologia, getTds_schede_cronologia, getTds_schede_cronologie, updateTds_schede_cronologia } from '../controller/tds_schede_cronologia.controller';

const tds_schede_cronologiaRoutes = Router();

tds_schede_cronologiaRoutes.route('/')
  .get(getTds_schede_cronologie)
  .post(createTds_schede_cronologia);

  tds_schede_cronologiaRoutes.route('/:tds_schede_cronologiaId')
  .get(getTds_schede_cronologia)
  .put(updateTds_schede_cronologia)
  .delete(deleteTds_schede_cronologia);

export default tds_schede_cronologiaRoutes;
