// pages/index.ts
import { Request, Response } from 'express';
import { cookieChecker } from '../helpers/authHelpers';
import Cookies from "cookies";

export async function handleIndexPage(req: Request, res: Response): Promise<void> {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get("jwt");

  if (!jwt) {
    // Il cookie JWT non è presente, gestisci di conseguenza
    return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
  }

  try {
    const userType = await cookieChecker(jwt);

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
    console.error("Error during cookieChecker check:", error);
  }
}
