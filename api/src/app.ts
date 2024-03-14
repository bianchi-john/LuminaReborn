import express, { Request, Response, Application } from 'express';
import { HttpResponse } from './domain/response';
import { Code } from './enum/code.enum';
import { Status } from './enum/status.enum';
import ip from 'ip';
import cors from 'cors';
import schedaRoutes from './routes/scheda.routes';
import searchRoutes from './routes/search.routes';
import schedatoreRoutes from './routes/schedatore.routes';
import adminRoutes from './routes/admin.routes';
import suggestionRoutes from './routes/suggestions.routes';
import { handleIndexPage } from './pages/index';
import { handleSchedaPage } from './pages/scheda';
import { handleLoginPage, handleLoginPost } from './pages/login';
import { handleBozzePage } from './pages/bozze';
import { handleSchedeInApprovazionePage } from './pages/schedeInApprovazione';
import { handleAmministratorePage } from './pages/amministratore';
import { handleBozzaEditorPage } from './pages/bozzaEditor';
import { handleValutaBozzaPage } from './pages/valutaBozza';

import process from 'process';
import path from 'path'; // Aggiunto il modulo 'path' per gestire i percorsi dei file

const viewsPath = path.join(__dirname, './views'); // Cartella contenente i file HTML

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

  // ROUTES
  private middleWare(): void {
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json({ limit: '500mb' })); // Imposta il limite della richiesta JSON a 50 MB
    this.app.use(express.urlencoded({ limit: '50mb', extended: true })); // Imposta il limite della richiesta URL codificata a 50 MB
    this.app.use(express.json());
    this.app.set('views', viewsPath);
    this.app.set('view engine', 'ejs');
    this.app.use('/styles', express.static(path.join(__dirname, 'views', 'styles')));
    this.app.use('/scripts', express.static(path.join(__dirname, 'views', 'scripts')));
    this.app.use('/img', express.static(path.join(__dirname, 'views', 'img')));
  }

  private routes(): void {
    // PAGES
    this.app.get('/', handleIndexPage);
    this.app.get('/scheda', handleSchedaPage);
    this.app.get('/login', handleLoginPage);
    this.app.post('/login', handleLoginPost);
    this.app.get('/bozze', handleBozzePage);
    this.app.get('/schedeInApprovazione', handleSchedeInApprovazionePage);
    this.app.get('/amministratore', handleAmministratorePage);
    this.app.get('/bozzaEditor', handleBozzaEditorPage);
    this.app.get('/valutaBozza', handleValutaBozzaPage);

    // SERVICES
    const authOptions = { url: process.env.AUTH_URL};
    this.app.use('/schede', schedaRoutes);
    this.app.use('/search', searchRoutes);
    this.app.use('/manageBozze', schedatoreRoutes);
    this.app.use('/admin', adminRoutes);
    this.app.use('/suggestions', suggestionRoutes);



    // 404 Not Found
    this.app.all('*', (_: Request, res: Response) => res.status(Code.NOT_FOUND).send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
  }
}
