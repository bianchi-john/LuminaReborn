import { Router } from 'express';
import { getBozzeForAdmin, approveScheda, rejectBozza, getBozza, getSchedePubblicate, deleteSchedaPubblicata } from '../controller/admin.controller';

const adminRoutes = Router();

adminRoutes.route('/')
  .get(getBozzeForAdmin)
  .post(approveScheda)
  .delete(rejectBozza);

// Prima di '/:schedaId', altrimenti "pubblicate" verrebbe preso per un id
adminRoutes.route('/pubblicate')
  .get(getSchedePubblicate)
  .delete(deleteSchedaPubblicata);

adminRoutes.route('/:schedaId')
  .get(getBozza);

export default adminRoutes;
