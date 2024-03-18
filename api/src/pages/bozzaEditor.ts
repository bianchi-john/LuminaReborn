// pages/bozzaEditor.ts
import { Request, Response } from 'express';
import Cookies from 'cookies';
import { cookieChecker } from '../helpers/authHelpers';

export async function handleBozzaEditorPage(req: Request, res: Response): Promise<void> {
  const cookies = new Cookies(req, res);
  const jwt = cookies.get("jwt");

  if (!jwt) {
    // Handle if JWT cookie is not present
    return res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
  }

  try {
    const userType = await cookieChecker(jwt);

    if (userType === 'admin' || userType === 'schedatore') {
      // User is either admin or schedatore
      res.render('bozzaEditor', { richTextScript: '/scripts/richText.js', richTextStyle: '/styles/richText.css', cssFilePath: '/styles/bozzaEditor.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/bozzaEditor.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
    } else {
      // User is not admin or schedatore
      res.render('index', { cssFilePath: '/styles/index.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
    }
  } catch (error) {
    console.error("Error during cookieChecker check:", error);
  }
}
