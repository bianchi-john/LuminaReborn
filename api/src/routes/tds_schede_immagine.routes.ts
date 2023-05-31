import { Router } from 'express';
import { createTds_schede_immagine, deleteTds_schede_immagine, getTds_schede_immagine, getTds_schede_immagini, updateTds_schede_immagine } from '../controller/tds_schede_immagine.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_immagini)
  .post(createTds_schede_immagine);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_immagine)
  .put(updateTds_schede_immagine)
  .delete(deleteTds_schede_immagine);

export default misuraRoutes;
