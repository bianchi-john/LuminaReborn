import { Router } from 'express';
import { createTds_schede_misura, deleteTds_schede_misura, getTds_schede_misura, getTds_schede_misure, updateTds_schede_misura } from '../controller/tds_schede_misura.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_misure)
  .post(createTds_schede_misura);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_misura)
  .put(updateTds_schede_misura)
  .delete(deleteTds_schede_misura);

export default misuraRoutes;
