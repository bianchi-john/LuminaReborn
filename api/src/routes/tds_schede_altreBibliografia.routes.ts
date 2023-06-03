import { Router } from 'express';
import { createTds_schede_altreBibliografia, deleteTds_schede_altreBibliografia, getTds_schede_altreBibliografia, getTds_schede_altreBibliografie, updateTds_schede_altreBibliografia } from '../controller/tds_schede_altreBibliografia.controller';

const misuraRoutes = Router();

misuraRoutes.route('/')
  .get(getTds_schede_altreBibliografie)
  .post(createTds_schede_altreBibliografia);

  misuraRoutes.route('/:misuraId')
  .get(getTds_schede_altreBibliografia)
  .put(updateTds_schede_altreBibliografia)
  .delete(deleteTds_schede_altreBibliografia);

export default misuraRoutes;
