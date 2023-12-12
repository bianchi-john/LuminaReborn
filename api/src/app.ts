import express, { Request, Response, Application } from 'express';
import ip from 'ip';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import schedaRoutes from './routes/scheda.routes';
import bibliografiaRoutes from './routes/bibliografia.routes';
import documentazioniFotograficaRoutes from './routes/documentazioneFotografica.routes';
import altreBibliografiaRoutes from './routes/altreBibliografia.routes';
import inventarioRoutes from './routes/inventario.routes'
import materialeRoutes from './routes/materiale.routes'
import misuraRoutes from './routes/misura.routes'
import mostraRoutes from './routes/mostra.routes'
import cronologiaRoutes from './routes/cronologia.routes'
import provenienzaRoutes from './routes/provenienza.routes'
import tds_schede_bibliografiaRoutes from './routes/tds_schede_bibliografia.routes'
import tds_schede_altreBibliografiaRoutes from './routes/tds_schede_altreBibliografia.routes'
import tds_schede_inventarioRoutes from './routes/tds_schede_inventario.routes'
import tds_schede_materialeRoutes from './routes/tds_schede_materiale.routes'
import tds_schede_misuraRoutes from './routes/tds_schede_misura.routes'
import tds_schede_gruppo_misuraRoutes from './routes/tds_schede_gruppo_misure.routes'
import tds_schede_mostraRoutes from './routes/tds_schede_mostra.routes'
import tds_schede_cronologiaRoutes from './routes/tds_schede_cronologia.routes'
import tds_schede_provenienzaRoutes from './routes/tds_schede_provenienza.routes'
import tds_schede_tecnicaRoutes from './routes/tds_schede_tecnica.routes'
import tds_schede_ubicazioneRoutes from './routes/tds_schede_ubicazione.routes'
import tds_users_schedaRoutes from './routes/tds_users_scheda.routes'
import tds_schede_documentazioniFotograficaRoutes from './routes/tds_schede_documentazioneFotografica.routes'
import tecnicaRoutes from './routes/tecnica.routes'
import ubicazioneRoutes from './routes/ubicazione.routes'
import autoreRoutes from './routes/autore.routes'
import immagineRoutes from './routes/immagine.routes'
import tds_schede_autoreRoutes from './routes/tds_schede_autore.routes'
import tds_schede_immagineRoutes from './routes/tds_schede_immagine.routes'
import searchRoutes from './routes/search.routes'
import authMiddleware from '@moreillon/express_identification_middleware';


import process from 'process';

import { HttpResponse } from './domain/response';
import { Code } from './enum/code.enum';
import { Status } from './enum/status.enum';

export class App {
  private readonly app: Application;
  private readonly APPLICATION_RUNNING = 'application is running on:';
  private readonly ROUTE_NOT_FOUND = 'Route does not exist on the server.';
  private readonly nodeOptions: string[];

  constructor(private readonly port: string | number = process.env.SERVER_PORT || 3000) {
    this.app = express();
    this.middleWare();
    this.routes();
    this.nodeOptions = ['--max-old-space-size=4096'];

  }

  listen(): void {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096'; // Imposta le opzioni del nodo
    this.app.listen(this.port);
    console.info(`${this.APPLICATION_RUNNING} ${ip.address()}:${this.port}`);
        console.info(`${this.APPLICATION_RUNNING} ${ip.address()}:${this.port}`);
  }

  private middleWare(): void {
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
    const authOptions = { url: 'http://0.0.0.0:7071' };
    this.app.use(authMiddleware(authOptions));
  }

  private routes(): void {
    this.app.use('/users', userRoutes);
    this.app.use('/schede', schedaRoutes);
    this.app.use('/bibliografie', bibliografiaRoutes);
    this.app.use('/altreBibliografie', altreBibliografiaRoutes);
    this.app.use('/inventari', inventarioRoutes);
    this.app.use('/materiali', materialeRoutes);
    this.app.use('/misure', misuraRoutes);
    this.app.use('/mostre', mostraRoutes);
    this.app.use('/cronologie', cronologiaRoutes);
    this.app.use('/provenienze', provenienzaRoutes);
    this.app.use('/schede', schedaRoutes);
    this.app.use('/documentazioniFotografiche', documentazioniFotograficaRoutes);
    this.app.use('/tds_schede_bibliografie', tds_schede_bibliografiaRoutes);
    this.app.use('/tds_schede_documentazioniFotografiche', tds_schede_documentazioniFotograficaRoutes);
    this.app.use('/tds_schede_altreBibliografie', tds_schede_altreBibliografiaRoutes);
    this.app.use('/tds_schede_inventari', tds_schede_inventarioRoutes);
    this.app.use('/tds_schede_materiali', tds_schede_materialeRoutes);
    this.app.use('/tds_schede_misure', tds_schede_misuraRoutes);
    this.app.use('/tds_schede_gruppo_misure', tds_schede_gruppo_misuraRoutes);
    this.app.use('/tds_schede_mostre', tds_schede_mostraRoutes);
    this.app.use('/tds_schede_cronologie', tds_schede_cronologiaRoutes);
    this.app.use('/tds_schede_provenienze', tds_schede_provenienzaRoutes);
    this.app.use('/tds_schede_tecniche', tds_schede_tecnicaRoutes);
    this.app.use('/tds_schede_ubicazioni', tds_schede_ubicazioneRoutes);
    this.app.use('/tds_users_schede', tds_users_schedaRoutes);
    this.app.use('/tecniche', tecnicaRoutes);
    this.app.use('/ubicazioni', ubicazioneRoutes);
    this.app.use('/autori', autoreRoutes);
    this.app.use('/immagini', immagineRoutes);
    this.app.use('/tds_schede_autori', tds_schede_autoreRoutes);
    this.app.use('/tds_schede_immagini', tds_schede_immagineRoutes);
    this.app.use('/search', searchRoutes);

    this.app.get('/', (_: Request, res: Response)=> res.status(Code.OK).send(new HttpResponse(Code.OK, Status.OK, 'Welcome to the Lumina API v1.0.0')));
    this.app.all('*', (_: Request, res: Response)=> res.status(Code.NOT_FOUND).send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
  }
}
