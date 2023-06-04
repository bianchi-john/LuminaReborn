import { Router } from 'express';
import { createAltreBibliografia, deleteAltreBibliografia, getAltreBibliografia, getAltreBibliografie, updateAltreBibliografia } from '../controller/altreBibliografia.controller';

const bibliografiaRoutes = Router();

bibliografiaRoutes.route('/')
  .get(getAltreBibliografie)
  .post(createAltreBibliografia);

  bibliografiaRoutes.route('/:altreBibliografiaId')
  .get(getAltreBibliografia)
  .put(updateAltreBibliografia)
  .delete(deleteAltreBibliografia);

export default bibliografiaRoutes;
