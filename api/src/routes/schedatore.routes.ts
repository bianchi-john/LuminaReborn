import { Router } from 'express';
import { getSchedeForSchedatore} from '../controller/schedatore.controller';

const schedatoreRoutes = Router();

schedatoreRoutes.route('/')
  .get(getSchedeForSchedatore)

export default schedatoreRoutes;
