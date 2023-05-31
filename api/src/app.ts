import express, { Request, Response, Application } from 'express';
import ip from 'ip';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import schedaRoutes from './routes/scheda.routes';
import bibliografiaRoutes from './routes/bibliografia.routes';
import inventarioRoutes from './routes/inventario.routes'
import materiale from './routes/materiale.routes'
import misura from './routes/misura.routes'
import mostra from './routes/mostra.routes'
import provenienza from './routes/provenienza.routes'
import scheda from './routes/scheda.routes'
import tds_schede_bibliografia from './routes/tds_schede_bibliografia.routes'
import tds_schede_inventario from './routes/tds_schede_inventario.routes'
import tds_schede_materiale from './routes/tds_schede_materiale.routes'
import tds_schede_misura from './routes/tds_schede_misura.routes'
import tds_schede_mostra from './routes/tds_schede_mostra.routes'
import tds_schede_provenienza from './routes/tds_schede_provenienza.routes'
import tds_schede_tecnica from './routes/tds_schede_tecnica.routes'
import tds_schede_ubicazione from './routes/tds_schede_ubicazione.routes'
import tds_users_scheda from './routes/tds_users_scheda.routes'
import tecnica from './routes/tecnica.routes'
import ubicazione from './routes/ubicazione.routes'
import autore from './routes/autore.routes'
import immagine from './routes/immagine.routes'
import tds_schede_autore from './routes/tds_schede_autore.routes'
import tds_schede_immagine from './routes/tds_schede_autore.routes'

import { HttpResponse } from './domain/response';
import { Code } from './enum/code.enum';
import { Status } from './enum/status.enum';

export class App {
  private readonly app: Application;
  private readonly APPLICATION_RUNNING = 'application is running on:';
  private readonly ROUTE_NOT_FOUND = 'Route does not exist on the server';

  constructor(private readonly port: (string | number) = process.env.SERVER_PORT || 3000) {
    this.app = express();
    this.middleWare();
    this.routes();
  }

  listen(): void {
    this.app.listen(this.port);
    console.info(`${this.APPLICATION_RUNNING} ${ip.address()}:${this.port}`);
  }

  private middleWare(): void {
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use('/users', userRoutes);
    this.app.use('/schede', schedaRoutes);
    this.app.use('/bibliografie', bibliografiaRoutes);
    this.app.use('/inventariRoutes', inventarioRoutes);
    this.app.use('/materiali', materiale);
    this.app.use('/misure', misura);
    this.app.use('/mostre', mostra);
    this.app.use('/provenienze', provenienza);
    this.app.use('/schede', scheda);
    this.app.use('/tds_schede_bibliografie', tds_schede_bibliografia);
    this.app.use('/tds_schede_inventari', tds_schede_inventario);
    this.app.use('/tds_schede_materiali', tds_schede_materiale);
    this.app.use('/tds_schede_misure', tds_schede_misura);
    this.app.use('/tds_schede_mostre', tds_schede_mostra);
    this.app.use('/tds_schede_provenienze', tds_schede_provenienza);
    this.app.use('/tds_schede_tecniche', tds_schede_tecnica);
    this.app.use('/tds_schede_ubicazioni', tds_schede_ubicazione);
    this.app.use('/tds_users_schede', tds_users_scheda);
    this.app.use('/tecniche', tecnica);
    this.app.use('/ubicazioni', ubicazione);
    this.app.use('/autori', autore);
    this.app.use('/immagini', immagine);
    this.app.use('/tds_schede_autori', tds_schede_autore);
    this.app.use('/tds_schede_immagine', tds_schede_immagine);



    inventarioRoutes













    this.app.get('/', (_: Request, res: Response)=> res.status(Code.OK).send(new HttpResponse(Code.OK, Status.OK, 'Welcome to the Lumina API v1.0.0')));
    this.app.all('*', (_: Request, res: Response)=> res.status(Code.NOT_FOUND).send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
  }
}
