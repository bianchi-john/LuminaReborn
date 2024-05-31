
import { Router } from 'express';
import {deleteScheda, getScheda, updateScheda} from '../controller/scheda.controller';

const schedaRoutes = Router();


  schedaRoutes.route('/:schedaId')
  .get(getScheda)
  .put(updateScheda)
  .delete(deleteScheda);

export default schedaRoutes;
