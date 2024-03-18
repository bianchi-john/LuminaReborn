// pages/valutaBozza.ts
import { Request, Response } from 'express';

export function handleValutaBozzaPage(req: Request, res: Response): void {
  res.render('valutaBozza', { cssFilePath: '/styles/scheda.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/valutaBozza.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
}
