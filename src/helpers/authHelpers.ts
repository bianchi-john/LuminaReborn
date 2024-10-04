import { Request, Response, NextFunction } from 'express';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import Cookies from 'cookies';
import axios from 'axios';
import { UserData } from '../interface/user';
import { IncomingMessage, ServerResponse } from 'http';

// Funzione di controllo del cookie
export const cookieChecker = async (jwt: string): Promise<boolean | string> => {
  console.log(`cookieChecker: Checking cookie with JWT: ${jwt}`);
  try {
    const response = await axios.get('http://192.168.0.4/users/self', {
      params: { jwt }
    });

    if (response.status === 200) {
      const userData = response.data;
      
      // Fixare bug della data (pensa che sia stato creato il giorno prima il cookie)
      // console.log(`cookieChecker: User data retrieved - Creation Date: ${userData.creation_date}, isAdmin: ${userData.isAdmin}`);
      // // Estrai il timestamp di creazione in UTC
      // const creationTimestamp = new Date(userData.creation_date).getTime();
      // // Calcola esattamente 8 ore fa rispetto all'orario attuale, senza fuso orario
      // const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;

      // // Ora confronta se il token è più vecchio di 8 ore
      // if (creationTimestamp < eightHoursAgo) {
      //   console.log('cookieChecker: Token expired - more than 8 hours old.');
      //   return false;
      // }

      if (userData.isAdmin === true) {
        console.log('cookieChecker: User is an admin.');
        return 'admin';
      } else if (!userData.hasOwnProperty('isAdmin')) {
        console.log('cookieChecker: User is a schedatore.');
        return 'schedatore';
      } else {
        console.log('cookieChecker: User is neither admin nor schedatore.');
        return false;
      }
    } else {
      console.log('cookieChecker: User data retrieval failed.');
      return false;
    }
  } catch (error) {
    console.error('cookieChecker: Error while checking cookie:', error);
    return false;
  }
};

// Controllo dei privilegi a livello di route e non di pagina
export const onlySchedatore = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get('jwt');
  console.log(`onlySchedatore: Checking schedatore privileges with JWT: ${jwt}`);

  if (!jwt) {
    console.log('onlySchedatore: JWT missing.');
    return res.status(401).send('Accesso negato. JWT mancante.');
  }

  try {
    const result = await cookieChecker(jwt);
    if (result === 'schedatore') {
      console.log('onlySchedatore: Access granted to schedatore.');
      next(); // Se il risultato è 'schedatore', procedi alla route successiva
    } else {
      console.log('onlySchedatore: Access denied - not schedatore.');
      res.status(403).send('Accesso negato. Non autorizzato.');
    }
  } catch (error) {
    console.error('onlySchedatore: Server error occurred:', error);
    res.status(500).send('Errore del server.');
  }
}

// Controllo dei privilegi a livello di route e non di pagina
export const onlyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get('jwt');
  console.log(`onlyAdmin: Checking admin privileges with JWT: ${jwt}`);

  if (!jwt) {
    console.log('onlyAdmin: JWT missing.');
    return res.status(401).send('Accesso negato. JWT mancante.');
  }

  try {
    const result = await cookieChecker(jwt);
    if (result === 'admin') {
      console.log('onlyAdmin: Access granted to admin.');
      next(); // Se il risultato è 'admin', procedi alla route successiva
    } else {
      console.log('onlyAdmin: Access denied - not admin.');
      res.status(403).send('Accesso negato. Non autorizzato.');
    }
  } catch (error) {
    console.error('onlyAdmin: Server error occurred:', error);
    res.status(500).send('Errore del server.');
  }
}

// Ottengo il cookie di autenticazione dal client
const getJwtFromRequest = (req: Request, res: Response): string | undefined | boolean => {
  try {
    const cookies = new Cookies(req, res);
    const jwt = cookies.get('jwt');
    console.log(`getJwtFromRequest: Retrieved JWT: ${jwt}`);

    if (!jwt) {
      console.log('getJwtFromRequest: JWT not found in cookies.');
      return false;
    }

    return jwt;
  } catch (error) {
    console.error('getJwtFromRequest: Error retrieving JWT:', error);
    res.status(403).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Errore nel recupero del JWT'));
    return undefined;
  }
};

// Capisco che tipo di user è il client dal suo token di autenticazione
export const getUserData = async (req: Request, res: Response): Promise<UserData | false> => {
  let jwt = getJwtFromRequest(req, res);
  console.log(`getUserData: Retrieved JWT for user data: ${jwt}`);

  if (jwt) {
    try {
      const response = await axios.get('http://192.168.0.4/users/self', {
        params: { jwt }
      });
      if (response.status === 200) {
        let userData: UserData = response.data;
        console.log(`getUserData: User data retrieved - User: ${userData.username}`);
        return userData;
      } else {
        console.log('getUserData: Failed to retrieve user data.');
        return false;
      }
    } catch (error) {
      console.error('getUserData: Error retrieving user data:', error);
      res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      return false;
    }
  } else {
    console.log('getUserData: JWT not available, cannot retrieve user data.');
    return false;
  }
};
