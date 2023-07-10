import { Router } from 'express';
import { genericSearch} from '../controller/search.controller';

const searchRoutes = Router();

searchRoutes.route('/')
  .get(genericSearch)

export default searchRoutes;
