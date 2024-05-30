
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
  try {
    const response = await axios.get('http://172.22.0.4/users/self', {
      params: { jwt }
    });

    if (response.status === 200) {
      const userData = response.data;
      // Controllo della data di creazione del token
      const creationTimestamp = new Date(userData.creation_date).getTime();
      const eightHoursAgo = new Date().getTime() - 8 * 60 * 60 * 1000;

      if (creationTimestamp < eightHoursAgo) {
        return false;
      }

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
    return false;
  }
};

// Controllo dei privilegi a livello di route e non di pagina
export const onlySchedatore = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get('jwt');

  if (!jwt) {
    return res.status(401).send('Accesso negato. JWT mancante.');
  }

  try {
    const result = await cookieChecker(jwt);
    if (result === 'schedatore') {
      next(); // Se il risultato è 'schedatore', procedi alla route successiva
    } else {
      res.status(403).send('Accesso negato. Non autorizzato.');
    }
  } catch (error) {
    res.status(500).send('Errore del server.');
  }
}

// Controllo dei privilegi a livello di route e non di pagina
export const onlyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get('jwt');

  if (!jwt) {
    return res.status(401).send('Accesso negato. JWT mancante.');
  }

  try {
    const result = await cookieChecker(jwt);
    if (result === 'admin') {
      next(); // Se il risultato è 'schedatore', procedi alla route successiva
    } else {
      res.status(403).send('Accesso negato. Non autorizzato.');
    }
  } catch (error) {
    res.status(500).send('Errore del server.');
  }
}


// Ottengo il cooke di autenticazione dal client
const getJwtFromRequest = (req: Request, res: Response): string | undefined| boolean => {
  try {
    const cookies = new Cookies(req, res);
    const jwt = cookies.get('jwt');

    if (!jwt) {
      // If JWT is not found in cookies, handle it gracefully
      return false
    }

    return jwt;
  } catch (error) {
    // If an error occurs, handle it and return undefined
    console.error('Error retrieving JWT:', error);
    res.status(403).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Errore nel recupero del JWT'));
    return undefined;
  }
};

// Capisco che tipo di user è il client dal suo token di autenticazione
export const getUseData = async (req: Request, res: Response): Promise<UserData | false> => {
  
  let jwt = getJwtFromRequest(req, res);
  if (jwt) {
    try {
      const response = await axios.get('http://172.22.0.4/users/self', {
        params: { jwt }
      });
      if (response.status === 200) {
        let userData: UserData = response.data;
        return userData;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Non è stato possibile recuperare il nome utente dal sistema di gestione utenti:', error);
      res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      return false;
    }

  }
  else {
    return false;

  }
};
