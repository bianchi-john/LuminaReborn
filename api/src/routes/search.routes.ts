import { Router } from 'express';
import { advancedSearch} from '../controller/search.controller';

const searchRoutes = Router();

searchRoutes.route('/')
  .get(advancedSearch)

export default searchRoutes;
