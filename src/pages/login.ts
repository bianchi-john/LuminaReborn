// pages/login.ts
import { Request, Response } from 'express';
import axios from 'axios';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

export function handleLoginPage(req: Request, res: Response): void {
  res.render('login', { cssFilePath: '/styles/login.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/login.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', address: process.env});
}

export async function handleLoginPost(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  const data = {
    username: username,
    password: password
  };

  try {
    const userManagerUrl = process.env.USER_MANAGER_API_URL || 'http://user-manager-api';
    const response = await axios.post(`${userManagerUrl}/auth/login`, JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const result = response.data;

      // Save JWT token in a cookie
      res.cookie('jwt', result.jwt, { path: '/' });

      res.status(200).send({ success: true });
    } else {
      res.status(response.status).send(response.data);
    }
  } catch (error) {
    // Non si registra né si rimanda l'errore completo di axios: contiene la richiesta,
    // cioè anche la password digitata
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401 || status === 403 || status === 404) {
      console.warn(`Login non riuscito per "${String(username).slice(0, 50)}" (user-manager: ${status})`);
      res.status(401).send({ success: false, message: 'Nome utente o password errati' });
    } else {
      console.error(`Errore durante il login: user-manager non raggiungibile o in errore (${status ?? 'nessuna risposta'})`);
      res.status(502).send({ success: false, message: 'Servizio di accesso non disponibile' });
    }
  }
}
