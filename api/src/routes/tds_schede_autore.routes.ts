import { Router } from 'express';
import { createTds_schede_autore, deleteTds_schede_autore, getTds_schede_autore, getTds_schede_autori, updateTds_schede_autore } from '../controller/tds_schede_autore.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_autori)
  .post(createTds_schede_autore);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_autore)
  .put(updateTds_schede_autore)
  .delete(deleteTds_schede_autore);

export default misuraRoutes;
