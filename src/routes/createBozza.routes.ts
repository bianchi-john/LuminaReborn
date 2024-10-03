import { Router } from 'express';
import {createScheda} from '../controller/scheda.controller';

const createBozzaRoutes = Router();

createBozzaRoutes.route('/')
    .post(createScheda)

  
export default createBozzaRoutes;
