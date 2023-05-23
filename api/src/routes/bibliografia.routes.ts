import { Router } from 'express';
import { createBibliografia, deleteBibliografia, getBibliografia, getBibliografie, updateBibliografia } from '../controller/bibliografia.controller';

const bibliografiaRoutes = Router();

bibliografiaRoutes.route('/')
  .get(getBibliografie)
  .post(createBibliografia);

  bibliografiaRoutes.route('/:bibliografiaId')
  .get(getBibliografia)
  .put(updateBibliografia)
  .delete(deleteBibliografia);

export default bibliografiaRoutes;
