import { Router } from 'express';
import { getSuggestions} from '../controller/scheda.controller';

const suggestionRoutes = Router();

suggestionRoutes.route('/')
  .get(getSuggestions)

export default suggestionRoutes;
