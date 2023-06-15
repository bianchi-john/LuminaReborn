"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_documentazioniFotografica_controller_1 = require("../controller/tds_schede_documentazioniFotografica.controller");
const tds_schede_documentazioniFotograficaRoutes = (0, express_1.Router)();
tds_schede_documentazioniFotograficaRoutes.route('/')
    .get(tds_schede_documentazioniFotografica_controller_1.getTds_schede_documentazioniFotografiche)
    .post(tds_schede_documentazioniFotografica_controller_1.createTds_schede_documentazioniFotografica);
tds_schede_documentazioniFotograficaRoutes.route('/:tds_schede_documentazioniFotograficaId')
    .get(tds_schede_documentazioniFotografica_controller_1.getTds_schede_documentazioniFotografica)
    .put(tds_schede_documentazioniFotografica_controller_1.updateTds_schede_documentazioniFotografica)
    .delete(tds_schede_documentazioniFotografica_controller_1.deleteTds_schede_documentazioniFotografica);
exports.default = tds_schede_documentazioniFotograficaRoutes;
