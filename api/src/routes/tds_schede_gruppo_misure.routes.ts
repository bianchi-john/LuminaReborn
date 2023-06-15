import { Router } from 'express';
import { createTds_schede_gruppo_misura, deleteTds_schede_gruppo_misura, getTds_schede_gruppo_misura, getTds_schede_gruppo_misure, updateTds_schede_gruppo_misura } from '../controller/tds_schede_gruppo_misura.controller';

const tds_schede_gruppo_misuraRoutes = Router();

tds_schede_gruppo_misuraRoutes.route('/')
  .get(getTds_schede_gruppo_misure)
  .post(createTds_schede_gruppo_misura);

  tds_schede_gruppo_misuraRoutes.route('/:tds_schede_gruppo_misuraId')
  .get(getTds_schede_gruppo_misura)
  .put(updateTds_schede_gruppo_misura)
  .delete(deleteTds_schede_gruppo_misura);

export default tds_schede_gruppo_misuraRoutes;
