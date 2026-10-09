import { Router } from 'express';
import { ah, notFound } from '../http/errors';
import { getFile, Variante, VARIANTI } from '../services/immagini.service';

/**
 * File delle immagini: /media/:id/anteprima | miniatura | originale.
 * Il pubblico riceve solo le versioni ridotte; l'originale richiede l'accesso.
 */
const media = Router();

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/tiff': 'tif' };

media.get(
  '/:id/:variante',
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const variante = req.params.variante as Variante;
    if (!Number.isInteger(id) || id <= 0 || !VARIANTI.includes(variante)) throw notFound();

    const file = await getFile(id, variante, req.user);
    res.setHeader('ETag', file.etag);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (variante === 'originale') {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Content-Disposition', `inline; filename="lumina-${id}-originale.${EXT[file.mime] ?? 'bin'}"`);
    } else {
      res.setHeader('Cache-Control', file.pubblica ? 'public, max-age=86400' : 'private, max-age=0, must-revalidate');
    }
    if (req.get('if-none-match') === file.etag) return void res.status(304).end();
    res.type(file.mime);
    res.setHeader('Content-Length', file.dati.length);
    res.end(file.dati);
  }),
);

export default media;
