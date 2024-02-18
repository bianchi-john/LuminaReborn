import { Router } from 'express';
import { getBozzeForAdmin, approveScheda, rejectBozza, getBozza} from '../controller/admin.controller';

const adminRoutes = Router();

adminRoutes.route('/')
  .get(getBozzeForAdmin)
  .post(approveScheda)
  .delete(rejectBozza)

  adminRoutes.route('/:schedaId')
  .get(getBozza)


export default adminRoutes;
