import { Router } from 'express';
import { createMostra, deleteMostra, getMostra, getMostre, updateMostra } from '../controller/mostra.controller';

const mostraRoutes = Router();

mostraRoutes.route('/')
  .get(getMostre)
  .post(createMostra);

  mostraRoutes.route('/:mostraId')
  .get(getMostra)
  .put(updateMostra)
  .delete(deleteMostra);

export default mostraRoutes;
