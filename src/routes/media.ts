import { Router } from 'express';
import { ah, notFound } from '../http/errors';
import { getFile, Variante, VARIANTI } from '../services/immagini.service';
import { CODICE_IMMAGINE } from '../util/codici';

/**
 * Image files: /media/:codice/anteprima | miniatura | originale (preview | thumbnail | original).
 * The code is random (non-sequential): images cannot be enumerated.
 * The public only gets the resized versions; the original requires login.
 */
const media = Router();

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/tiff': 'tif' };

media.get(
  '/:codice/:variante',
  ah(async (req, res) => {
    const { codice } = req.params;
    const variante = req.params.variante as Variante;
    if (!CODICE_IMMAGINE.test(codice) || !VARIANTI.includes(variante)) throw notFound();

    const file = await getFile(codice, variante, req.user);
    res.setHeader('ETag', file.etag);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (variante === 'originale') {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Content-Disposition', `inline; filename="lumina-${codice}-originale.${EXT[file.mime] ?? 'bin'}"`);
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
