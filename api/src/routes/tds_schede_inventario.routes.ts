import { Router } from 'express';
import { createTds_schede_inventario, deleteTds_schede_inventario, getTds_schede_inventario, getTds_schede_inventari, updateTds_schede_inventario } from '../controller/tds_schede_inventario.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_inventari)
  .post(createTds_schede_inventario);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_inventario)
  .put(updateTds_schede_inventario)
  .delete(deleteTds_schede_inventario);

export default misuraRoutes;
