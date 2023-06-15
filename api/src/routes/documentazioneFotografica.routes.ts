import { Router } from 'express';
import { createDocumentazioniFotografica, deleteDocumentazioniFotografica, getDocumentazioniFotografica, getDocumentazioniFotografiche, updateDocumentazioniFotografica } from '../controller/documentazioniFotografica.controller';

const documentazioniFotograficaRoutes = Router();

documentazioniFotograficaRoutes.route('/')
  .get(getDocumentazioniFotografiche)
  .post(createDocumentazioniFotografica);

  documentazioniFotograficaRoutes.route('/:documentazioniFotograficaId')
  .get(getDocumentazioniFotografica)
  .put(updateDocumentazioniFotografica)
  .delete(deleteDocumentazioniFotografica);

export default documentazioniFotograficaRoutes;
