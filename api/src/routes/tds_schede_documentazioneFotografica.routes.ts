import { Router } from 'express';
import { createTds_schede_documentazioniFotografica, deleteTds_schede_documentazioniFotografica, getTds_schede_documentazioniFotografica, getTds_schede_documentazioniFotografiche, updateTds_schede_documentazioniFotografica } from '../controller/tds_schede_documentazioniFotografica.controller';

const tds_schede_documentazioniFotograficaRoutes = Router();

tds_schede_documentazioniFotograficaRoutes.route('/')
  .get(getTds_schede_documentazioniFotografiche)
  .post(createTds_schede_documentazioniFotografica);

  tds_schede_documentazioniFotograficaRoutes.route('/:tds_schede_documentazioniFotograficaId')
  .get(getTds_schede_documentazioniFotografica)
  .put(updateTds_schede_documentazioniFotografica)
  .delete(deleteTds_schede_documentazioniFotografica);

export default tds_schede_documentazioniFotograficaRoutes;
