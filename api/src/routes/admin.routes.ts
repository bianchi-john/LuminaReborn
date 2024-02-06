import { Router } from 'express';
import { getBozzeForAdmin, approveScheda, rejectBozza} from '../controller/admin.controller';

const adminRoutes = Router();

adminRoutes.route('/')
  .get(getBozzeForAdmin)
  .post(approveScheda)
  .post(rejectBozza)

export default adminRoutes;
