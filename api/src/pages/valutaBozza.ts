// pages/valutaBozza.ts
import { Request, Response } from 'express';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();


export function handleValutaBozzaPage(req: Request, res: Response): void {
  res.render('valutaBozza', { cssFilePath: '/styles/scheda.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/valutaBozza.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', address: process.env});
}
