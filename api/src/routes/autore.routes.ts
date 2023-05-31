import { Router } from 'express';
import { createAutore, deleteAutore, getAutore, getAutori, updateAutore } from '../controller/autore.controller';

const autoreRoutes = Router();

autoreRoutes.route('/')
  .get(getAutori)
  .post(createAutore);

  autoreRoutes.route('/:autoreId')
  .get(getAutore)
  .put(updateAutore)
  .delete(deleteAutore);

export default autoreRoutes;
