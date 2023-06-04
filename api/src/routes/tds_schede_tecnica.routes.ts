import { Router } from 'express';
import { createTds_schede_tecnica, deleteTds_schede_tecnica, getTds_schede_tecnica, getTds_schede_tecniche, updateTds_schede_tecnica } from '../controller/tds_schede_tecnica.controller';

const tds_schede_tecnicaRoutes = Router();

tds_schede_tecnicaRoutes.route('/')
  .get(getTds_schede_tecniche)
  .post(createTds_schede_tecnica);

  tds_schede_tecnicaRoutes.route('/:tds_schede_tecnicaId')
  .get(getTds_schede_tecnica)
  .put(updateTds_schede_tecnica)
  .delete(deleteTds_schede_tecnica);

export default tds_schede_tecnicaRoutes;
