import { Router } from 'express';
import { createTds_schede_bibliografia, deleteTds_schede_bibliografia, getTds_schede_bibliografia, getTds_schede_bibliografie, updateTds_schede_bibliografia } from '../controller/tds_schede_bibliografia.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_bibliografie)
  .post(createTds_schede_bibliografia);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_bibliografia)
  .put(updateTds_schede_bibliografia)
  .delete(deleteTds_schede_bibliografia);

export default misuraRoutes;
