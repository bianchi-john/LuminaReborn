import { Router } from 'express';
import { createCronologia, deleteCronologia, getCronologia, getCronologie, updateCronologia } from '../controller/cronologia.controller';

const cronologiaRoutes = Router();

cronologiaRoutes.route('/')
  .get(getCronologie)
  .post(createCronologia);

  cronologiaRoutes.route('/:cronologiaId')
  .get(getCronologia)
  .put(updateCronologia)
  .delete(deleteCronologia);

export default cronologiaRoutes;
