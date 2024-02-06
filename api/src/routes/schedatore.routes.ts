import { Router } from 'express';
import { getSchedeForSchedatore, deleteSchedaForSchedatore, schedaToAdmin} from '../controller/schedatore.controller';

const schedatoreRoutes = Router();

schedatoreRoutes.route('/')
  .get(getSchedeForSchedatore)
  .delete(deleteSchedaForSchedatore)
  .post(schedaToAdmin)

export default schedatoreRoutes;
