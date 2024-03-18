// pages/scheda.ts
import { Request, Response } from 'express';

export function handleSchedaPage(req: Request, res: Response): void {
  res.render('scheda', { cssFilePath: '/styles/scheda.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/scheda.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
}
