import { Router } from 'express';
import { createTds_schede_inventario, deleteTds_schede_inventario, getTds_schede_inventario, getTds_schede_inventari, updateTds_schede_inventario } from '../controller/tds_schede_inventario.controller';

const tds_schede_inventarioRoutes = Router();

tds_schede_inventarioRoutes.route('/')
  .get(getTds_schede_inventari)
  .post(createTds_schede_inventario);

  tds_schede_inventarioRoutes.route('/:tds_schede_inventarioId')
  .get(getTds_schede_inventario)
  .put(updateTds_schede_inventario)
  .delete(deleteTds_schede_inventario);

export default tds_schede_inventarioRoutes;
