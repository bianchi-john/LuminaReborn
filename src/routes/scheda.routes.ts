import { Router } from 'express';
import { getScheda } from '../controller/scheda.controller';

const schedaRoutes = Router();

// Solo lettura delle schede pubblicate. Le rotte PUT e DELETE erano aperte a
// chiunque, senza login: le schede si gestiscono da /manageBozze (schedatori)
// e /admin (amministratori), che controllano chi è collegato.
schedaRoutes.route('/:schedaId')
  .get(getScheda);

export default schedaRoutes;
