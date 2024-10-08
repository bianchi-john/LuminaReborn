// pages/login.ts
import { Request, Response } from 'express';
import axios from 'axios';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

export function handleLoginPage(req: Request, res: Response): void {
  res.render('login', { cssFilePath: '/styles/login.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/login.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', address: process.env});
}

export async function handleLoginPost(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  const data = {
    username: username,
    password: password
  };

  try {
    const response = await axios.post('http://192.168.0.4/auth/login', JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const result = response.data;

      // Save JWT token in a cookie
      res.cookie('jwt', result.jwt, { path: '/' });

      res.status(200).send({ success: true });
    } else {
      res.status(response.status).send(response.data);
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send(error);
  }
}
