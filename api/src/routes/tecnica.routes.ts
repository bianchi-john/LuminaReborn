import { Router } from 'express';
import { createTecnica, deleteTecnica, getTecnica, getTecniche, updateTecnica } from '../controller/tecnica.controller';

const tecnicaRoutes = Router();

tecnicaRoutes.route('/')
  .get(getTecniche)
  .post(createTecnica);

  tecnicaRoutes.route('/:tecnicaId')
  .get(getTecnica)
  .put(updateTecnica)
  .delete(deleteTecnica);

export default tecnicaRoutes;
