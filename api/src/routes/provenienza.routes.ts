import { Router } from 'express';
import { createProvenienza, deleteProvenienza, getProvenienza, getProvenienze, updateProvenienza } from '../controller/provenienza.controller';

const provenienzaRoutes = Router();

provenienzaRoutes.route('/')
  .get(getProvenienze)
  .post(createProvenienza);

  provenienzaRoutes.route('/:provenienzaId')
  .get(getProvenienza)
  .put(updateProvenienza)
  .delete(deleteProvenienza);

export default provenienzaRoutes;
