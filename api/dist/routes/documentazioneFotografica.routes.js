"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentazioniFotografica_controller_1 = require("../controller/documentazioniFotografica.controller");
const documentazioniFotograficaRoutes = (0, express_1.Router)();
documentazioniFotograficaRoutes.route('/')
    .get(documentazioniFotografica_controller_1.getDocumentazioniFotografiche)
    .post(documentazioniFotografica_controller_1.createDocumentazioniFotografica);
documentazioniFotograficaRoutes.route('/:documentazioniFotograficaId')
    .get(documentazioniFotografica_controller_1.getDocumentazioniFotografica)
    .put(documentazioniFotografica_controller_1.updateDocumentazioniFotografica)
    .delete(documentazioniFotografica_controller_1.deleteDocumentazioniFotografica);
exports.default = documentazioniFotograficaRoutes;
