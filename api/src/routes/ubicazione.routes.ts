import { Router } from 'express';
import { createUbicazione, deleteUbicazione, getUbicazione, getUbicazioni, updateUbicazione } from '../controller/ubicazione.controller';

const ubicazioneRoutes = Router();

ubicazioneRoutes.route('/')
  .get(getUbicazioni)
  .post(createUbicazione);

  ubicazioneRoutes.route('/:ubicazioneId')
  .get(getUbicazione)
  .put(updateUbicazione)
  .delete(deleteUbicazione);

export default ubicazioneRoutes;
