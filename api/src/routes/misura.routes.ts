import { Router } from 'express';
import { createMisura, deleteMisura, getMisura, getMisure, updateMisura } from '../controller/misura.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getMisure)
  .post(createMisura);

  misuraRoutes.route('/:misuraId')
  .get(getMisura)
  .put(updateMisura)
  .delete(deleteMisura);

export default misuraRoutes;
