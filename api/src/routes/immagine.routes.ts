import { Router } from 'express';
import { createImmagine, deleteImmagine, getImmagine, getImmagini, updateImmagine } from '../controller/immagine.controller';

const immagineRoutes = Router();

immagineRoutes.route('/')
  .get(getImmagini)
  .post(createImmagine);

  immagineRoutes.route('/:immagineId')
  .get(getImmagine)
  .put(updateImmagine)
  .delete(deleteImmagine);

export default immagineRoutes;
