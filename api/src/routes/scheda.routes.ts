import { Router } from 'express';
import { createScheda, deleteScheda, getScheda, getSchede, updateScheda } from '../controller/scheda.controller';

const schedaRoutes = Router();

schedaRoutes.route('/')
  .get(getSchede)
  .post(createScheda);

  schedaRoutes.route('/:schedaId')
  .get(getScheda)
  .put(updateScheda)
  .delete(deleteScheda);

export default schedaRoutes;
