import { Router } from 'express';
import { createTds_schede_ubicazione, deleteTds_schede_ubicazione, getTds_schede_ubicazione, getTds_schede_ubicazioni, updateTds_schede_ubicazione } from '../controller/tds_schede_ubicazione.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_ubicazioni)
  .post(createTds_schede_ubicazione);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_ubicazione)
  .put(updateTds_schede_ubicazione)
  .delete(deleteTds_schede_ubicazione);

export default misuraRoutes;
