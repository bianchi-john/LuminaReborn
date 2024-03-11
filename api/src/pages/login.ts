// pages/login.ts
import { Request, Response } from 'express';
import axios from 'axios';

export function handleLoginPage(req: Request, res: Response): void {
  res.render('login', { cssFilePath: '/styles/login.css',  sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/login.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
}

export async function handleLoginPost(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  const data = {
    username: username,
    password: password
  };

  try {
    const response = await axios.post('http://172.22.0.4/auth/login', JSON.stringify(data), {
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
