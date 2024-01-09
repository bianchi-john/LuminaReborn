// authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import Cookies from 'cookies';
import axios from 'axios';

export const isCookieOk = async (jwt: string): Promise<boolean | string> => {
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
    const isAdminUser = await isCookieOk(jwt);

    if (isAdminUser) {
      route(req, res, next);
    } else {
      res
        .status(403)
        .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
    }
  } catch (error) {
    console.error('Error during isCookieOk check:', error);
    res.status(500).send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
};
