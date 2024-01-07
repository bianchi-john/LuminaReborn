import express, { Request, Response, Application, NextFunction } from 'express';
import { HttpResponse } from './domain/response';
import { Code } from './enum/code.enum';
import { Status } from './enum/status.enum';
import Cookies from "cookies"
import ip from 'ip';
import cors from 'cors';
import schedaRoutes from './routes/scheda.routes';
import searchRoutes from './routes/search.routes'
import authMiddleware from '@moreillon/express_identification_middleware';
import process from 'process';
import axios from "axios"
import path from 'path'; // Aggiunto il modulo 'path' per gestire i percorsi dei file
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import querystring from 'querystring';

const viewsPath = path.join(__dirname, './views'); // Cartella contenente i file HTML

const isCookieOk = async (jwt: string): Promise<boolean | string> => {
  try {
    const response = await axios.get('http://172.22.0.4/users/self', {
      params: { jwt }
    });

    if (response.status === 200) {
      const userData = response.data;
      // Controllo della data di creazione del token
      const creationTimestamp = new Date(userData.creation_date).getTime();
      const eightHoursAgo = new Date().getTime() - 8 * 60 * 60 * 1000;

      // Per testare che funzioni gli do un minuto di tempo
      // const eightHoursAgo = new Date().getTime() - 1 * 60 * 1000; // 1 minuto fa

      if (creationTimestamp < eightHoursAgo) {
        // Il token è più vecchio di 8 ore, consideralo non valido
        return false;
      }

      // Controlla se è presente la proprietà isCookieOk e se è impostata su true
      if (userData.isAdmin === true) {
        return 'admin';
      } else if (!userData.hasOwnProperty('isAdmin')) {
        return 'schedatore';
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    // Se la richiesta fallisce con un 403, considera l'utente non un amministratore o uno schedatore
    return false;
  }
};


const onlyAdmin = async (req: Request, res: Response, next: NextFunction, route: (arg0: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, arg1: express.Response<any, Record<string, any>>, arg2: express.NextFunction) => void) => {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get("jwt");

  if (!jwt) {
    res.status(403).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
    return res.redirect('/');
  }

  try {
    const isAdminUser = await isCookieOk(jwt);

    if (isAdminUser) {
      // L'utente è un amministratore, consenti l'accesso alla route
      route(req, res, next);
    } else {
      // L'utente non è un amministratore, restituisci un errore 403
      return res.status(403).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
    }
  } catch (error) {
    // Gestisci gli errori durante la verifica dell'amministratore
    console.error("Error during isCookieOk check:", error);
    return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
};

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
    this.app.set('views', viewsPath);
    this.app.set('view engine', 'ejs');
  }

  private routes(): void {
    const authOptions = { url: 'http://172.22.0.2' };

    // SERVICES
    this.app.use('/schede', schedaRoutes);
    this.app.use('/search', searchRoutes);

    
    // PAGES, SCRIPTS AND STYLES
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use('/styles', express.static(path.join(__dirname, 'views/styles')));
    this.app.use('/scripts', express.static(path.join(__dirname, 'views/scripts')));
    this.app.use('/img', express.static(path.join(__dirname, 'views/img')));
  


      // Nella route per la pagina index
      this.app.get('/', async (req: Request, res: Response) => {
        const cookies = new Cookies(req, res);
        const jwt = cookies.get("jwt");

        if (!jwt) {
          // Il cookie JWT non è presente, gestisci di conseguenza
          return res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
        }

        try {
          const userType = await isCookieOk(jwt);

          if (userType === 'admin') {
            // L'utente è un amministratore
            res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: 'admin' });
          } else if (userType === 'schedatore') {
            // L'utente è uno schedatore
            res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: 'schedatore' });
          } else {
            // L'utente non è né amministratore né schedatore
            res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
          }
        } catch (error) {
          console.error("Error during isCookieOk check:", error);
          return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
        }
      });




    // SCHEDA
      this.app.get('/scheda', (req: Request, res: Response) => {
        res.render('scheda', { cssFilePath: '/styles/scheda.css', jsFilePath: '/scripts/scheda.js', imgFilePath:'/img' });
      });

      //LOGIN
      this.app.get('/login', (req: Request, res: Response) => {
        res.render('login', { cssFilePath: '/styles/login.css', jsFilePath: '/scripts/login.js', imgFilePath:'/img' });
      });
      this.app.post('/login', async (req: Request, res: Response) => {
        const { username, password } = req.body;
        const data = {
          username: username,
          password: password
        };
      
        try {
          const response = await axios.post('http://172.22.0.4/auth/login', JSON.stringify(data), {
            headers: {
              'Content-Type': 'application/json'
            }
          });
      
          if (response.status === 200) {
            const result = response.data;
      
            // Salva il token JWT in un cookie
            res.cookie('jwt', result.jwt, { path: '/' });
      
            res.status(200).send({ success: true });
          } else {
            res.status(response.status).send(response.data);
          }
        } catch (error) {
          console.error('Error during login:', error);
          res.status(500).send(error);
        }
      });


      // BOZZE
      this.app.get('/bozze', async (req: Request, res: Response) => {
        const cookies = new Cookies(req, res);
        const jwt = cookies.get("jwt");

        if (!jwt) {
          // Il cookie JWT non è presente, gestisci di conseguenza
          return res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
        }

        try {
          const userType = await isCookieOk(jwt);

          if (userType === 'admin' || userType === 'schedatore') {
            // L'utente è un amministratore
            res.render('bozze', { cssFilePath: '/styles/bozze.css', jsFilePath: '/scripts/bozze.js', imgFilePath: '/img', userType: userType });
          } else {
            // L'utente non è né amministratore né schedatore
            res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: userType });
          }
        } catch (error) {
          console.error("Error during isCookieOk check:", error);
          return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
        }
      });


      // SCHEDE IN APPROVAZIONE
      this.app.get('/schedeInApprovazione', async (req: Request, res: Response) => {
        const cookies = new Cookies(req, res);
        const jwt = cookies.get("jwt");

        if (!jwt) {
          // Il cookie JWT non è presente, gestisci di conseguenza
          return res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
        }

        try {
          const userType = await isCookieOk(jwt);

          if (userType === 'admin' || userType === 'schedatore') {
            // L'utente è un amministratore
            res.render('schedeInApprovazione', { cssFilePath: '/styles/schedeInApprovazione.css', jsFilePath: '/scripts/schedeInApprovazione.js', imgFilePath: '/img', userType: userType });
          } else {
            // L'utente non è né amministratore né schedatore
            res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
          }
        } catch (error) {
          console.error("Error during isCookieOk check:", error);
          return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
        }
      });


      // AMMINISTRATORE
        this.app.get('/amministratore', async (req: Request, res: Response) => {
        const cookies = new Cookies(req, res);
        const jwt = cookies.get("jwt");

        if (!jwt) {
          // Il cookie JWT non è presente, gestisci di conseguenza
          return res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
        }

        try {
          const userType = await isCookieOk(jwt);

          if (userType === 'admin') {
            // L'utente è un amministratore
            res.render('amministratore', { cssFilePath: '/styles/amministratore.css', jsFilePath: '/scripts/amministratore.js', imgFilePath: '/img', userType: userType });
          } else {
            // L'utente non è né amministratore né schedatore
            res.render('index', { cssFilePath: '/styles/index.css', jsFilePath: '/scripts/index.js', imgFilePath: '/img', userType: null });
          }
        } catch (error) {
          console.error("Error during isCookieOk check:", error);
          return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
        }
      });



    this.app.all('*', (_: Request, res: Response)=> res.status(Code.NOT_FOUND).send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
  }
}
