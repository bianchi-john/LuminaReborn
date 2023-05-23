import { Router } from 'express';
import { createMateriale, deleteMateriale, getMateriale, getMateriali, updateMateriale } from '../controller/materiale.controller';

const materialeRoutes = Router();

materialeRoutes.route('/')
  .get(getMateriali)
  .post(createMateriale);

  materialeRoutes.route('/:materialeId')
  .get(getMateriale)
  .put(updateMateriale)
  .delete(deleteMateriale);

export default materialeRoutes;
