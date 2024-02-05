import { Router } from 'express';
import { getSchedeForAmministratore} from '../controller/amministratore.controller';

const amminsitratoreRoutes = Router();

amminsitratoreRoutes.route('/')
  .get(getSchedeForAmministratore)

export default amminsitratoreRoutes;
