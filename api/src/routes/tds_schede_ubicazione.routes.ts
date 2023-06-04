import { Router } from 'express';
import { createTds_schede_ubicazione, deleteTds_schede_ubicazione, getTds_schede_ubicazione, getTds_schede_ubicazioni, updateTds_schede_ubicazione } from '../controller/tds_schede_ubicazione.controller';

const tds_schede_ubicazioneRoutes = Router();

tds_schede_ubicazioneRoutes.route('/')
  .get(getTds_schede_ubicazioni)
  .post(createTds_schede_ubicazione);

  tds_schede_ubicazioneRoutes.route('/:tds_schede_ubicazioneId')
  .get(getTds_schede_ubicazione)
  .put(updateTds_schede_ubicazione)
  .delete(deleteTds_schede_ubicazione);

export default tds_schede_ubicazioneRoutes;
