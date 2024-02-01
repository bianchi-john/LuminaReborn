import express, { Request, Response, Application, NextFunction } from 'express';
import { HttpResponse } from './domain/response';
import { Code } from './enum/code.enum';
import { Status } from './enum/status.enum';
import Cookies from "cookies"
import ip from 'ip';
import cors from 'cors';
import schedaRoutes from './routes/scheda.routes';
import searchRoutes from './routes/search.routes';
import authMiddleware from '@moreillon/express_identification_middleware';
import process from 'process';
import axios from "axios"
import path from 'path'; // Aggiunto il modulo 'path' per gestire i percorsi dei file
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import querystring from 'querystring';
import { isCookieOk, onlyAdmin } from './helpers/authHelpers'; // Importa le funzioni dal modulo

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
        return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
      }

      try {
        const userType = await isCookieOk(jwt);

        if (userType === 'admin') {
          // L'utente è un amministratore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: 'admin' });
        } else if (userType === 'schedatore') {
          // L'utente è uno schedatore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: 'schedatore' });
        } else {
          // L'utente non è né amministratore né schedatore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
        }
      } catch (error) {
        console.error("Error during isCookieOk check:", error);
        return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      }
    });




    // SCHEDA
    this.app.get('/scheda', (req: Request, res: Response) => {
      res.render('scheda', { cssFilePath: '/styles/scheda.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/scheda.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
    });

    //LOGIN
    this.app.get('/login', (req: Request, res: Response) => {
      res.render('login', { cssFilePath: '/styles/login.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/login.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
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
        return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
      }

      try {
        const userType = await isCookieOk(jwt);

        if (userType === 'admin' || userType === 'schedatore') {
          // L'utente è un amministratore o schedaotore
          res.render('bozze', { cssFilePath: '/styles/bozze.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/bozze.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
        } else {
          // L'utente non è né amministratore né schedatore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
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
        return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
      }

      try {
        const userType = await isCookieOk(jwt);

        if (userType === 'admin' || userType === 'schedatore') {
          // L'utente è un amministratore o schedaotore
          res.render('schedeInApprovazione', { cssFilePath: '/styles/schedeInApprovazione.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/schedeInApprovazione.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
        } else {
          // L'utente non è né amministratore né schedatore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
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
        return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
      }

      try {
        const userType = await isCookieOk(jwt);

        if (userType === 'admin') {
          // L'utente è un amministratore
          res.render('amministratore', { cssFilePath: '/styles/amministratore.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/amministratore.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
        } else {
          // L'utente non è né amministratore né schedatore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
        }
      } catch (error) {
        console.error("Error during isCookieOk check:", error);
        return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      }
    });


    // BOZZAEDITOR
    this.app.get('/bozzaEditor', async (req: Request, res: Response) => {
      const cookies = new Cookies(req, res);
      const jwt = cookies.get("jwt");

      if (!jwt) {
        // Il cookie JWT non è presente, gestisci di conseguenza
        return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
      }

      try {
        const userType = await isCookieOk(jwt);

        if (userType === 'admin' || userType === 'schedatore') {
          // L'utente è un amministratore o schedaotore
          res.render('bozzaEditor', { richTextScript: '/scripts/richText.js', richTextStyle: '/styles/richText.css', cssFilePath: '/styles/bozzaEditor.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/bozzaEditor.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
        } else {
          // L'utente non è né amministratore né schedatore
          res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
        }
      } catch (error) {
        console.error("Error during isCookieOk check:", error);
        return res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      }
    });

    this.app.all('*', (_: Request, res: Response) => res.status(Code.NOT_FOUND).send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
  }
}
