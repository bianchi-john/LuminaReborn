import { Router } from 'express';
import { createInventario, deleteInventario, getInventario, getInventari, updateInventario } from '../controller/inventario.controler';

const inventarioRoutes = Router();

inventarioRoutes.route('/')
  .get(getInventari)
  .post(createInventario);

  inventarioRoutes.route('/:inventarioId')
  .get(getInventario)
  .put(updateInventario)
  .delete(deleteInventario);

export default inventarioRoutes;
