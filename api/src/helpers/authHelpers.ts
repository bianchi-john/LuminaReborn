
import { Request, Response, NextFunction } from 'express';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import Cookies from 'cookies';
import axios from 'axios';
import { UserData } from '../interface/user';

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

export const onlyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
  route: (arg0: Request, arg1: Response, arg2: NextFunction) => void
) => {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get('jwt');

  if (!jwt) {
    res
      .status(403)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
    return res.redirect('/');
  }

  try {
    const isAdminUser = await cookieChecker(jwt);

    if (isAdminUser) {
      route(req, res, next);
    } else {
      res
        .status(403)
        .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
    }
  } catch (error) {
    console.error('Error during cookieChecker check:', error);
    res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
};






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
