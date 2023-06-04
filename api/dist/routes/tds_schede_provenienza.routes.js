"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_provenienza_controller_1 = require("../controller/tds_schede_provenienza.controller");
const tds_schede_provenienzaRoutes = (0, express_1.Router)();
tds_schede_provenienzaRoutes.route('/')
    .get(tds_schede_provenienza_controller_1.getTds_schede_provenienze)
    .post(tds_schede_provenienza_controller_1.createTds_schede_provenienza);
tds_schede_provenienzaRoutes.route('/:tds_schede_provenienzaId')
    .get(tds_schede_provenienza_controller_1.getTds_schede_provenienza)
    .put(tds_schede_provenienza_controller_1.updateTds_schede_provenienza)
    .delete(tds_schede_provenienza_controller_1.deleteTds_schede_provenienza);
exports.default = tds_schede_provenienzaRoutes;
