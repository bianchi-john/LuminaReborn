import { Router } from 'express';
import { createTds_schede_provenienza, deleteTds_schede_provenienza, getTds_schede_provenienza, getTds_schede_provenienze, updateTds_schede_provenienza } from '../controller/tds_schede_provenienza.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_provenienze)
  .post(createTds_schede_provenienza);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_provenienza)
  .put(updateTds_schede_provenienza)
  .delete(deleteTds_schede_provenienza);

export default misuraRoutes;
