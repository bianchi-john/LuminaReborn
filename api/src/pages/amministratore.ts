// pages/amministratore.ts
import { Request, Response } from 'express';
import Cookies from 'cookies';
import { cookieChecker } from '../helpers/authHelpers';
import { address } from 'ip';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();


export async function handleAmministratorePage(req: Request, res: Response): Promise<void> {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get("jwt");

  if (!jwt) {
    // Handle if JWT cookie is not present
    return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null, address: process.env});
  }

  try {
    const userType = await cookieChecker(jwt);

    if (userType === 'admin') {
      // User is an admin
      res.render('amministratore', { cssFilePath: '/styles/amministratore.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/amministratore.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType , address: process.env});
    } else {
      // User is not an admin
      res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null , address: process.env});
    }
  } catch (error) {
    console.error("Error during cookieChecker check:", error);
  }
}
