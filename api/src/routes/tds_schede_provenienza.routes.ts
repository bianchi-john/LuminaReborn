import { Router } from 'express';
import { createTds_schede_provenienza, deleteTds_schede_provenienza, getTds_schede_provenienza, getTds_schede_provenienze, updateTds_schede_provenienza } from '../controller/tds_schede_provenienza.controller';

const tds_schede_provenienzaRoutes = Router();

tds_schede_provenienzaRoutes.route('/')
  .get(getTds_schede_provenienze)
  .post(createTds_schede_provenienza);

  tds_schede_provenienzaRoutes.route('/:tds_schede_provenienzaId')
  .get(getTds_schede_provenienza)
  .put(updateTds_schede_provenienza)
  .delete(deleteTds_schede_provenienza);

export default tds_schede_provenienzaRoutes;
