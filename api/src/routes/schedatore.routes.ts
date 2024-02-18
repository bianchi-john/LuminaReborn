import { Router } from 'express';
import { getSchedeForSchedatore, deleteSchedaForSchedatore, schedaToAdmin, withdrawScheda} from '../controller/schedatore.controller';

const schedatoreRoutes = Router();

schedatoreRoutes.route('/')
  .get(getSchedeForSchedatore)
  .delete(deleteSchedaForSchedatore)
  .post(schedaToAdmin)
  .put(withdrawScheda)

export default schedatoreRoutes;
