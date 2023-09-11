import { Router } from 'express';
import { search} from '../controller/search.controller';

const searchRoutes = Router();

searchRoutes.route('/')
  .get(search)

export default searchRoutes;
