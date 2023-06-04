"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_tecnica_controller_1 = require("../controller/tds_schede_tecnica.controller");
const tds_schede_tecnicaRoutes = (0, express_1.Router)();
tds_schede_tecnicaRoutes.route('/')
    .get(tds_schede_tecnica_controller_1.getTds_schede_tecniche)
    .post(tds_schede_tecnica_controller_1.createTds_schede_tecnica);
tds_schede_tecnicaRoutes.route('/:tds_schede_tecnicaId')
    .get(tds_schede_tecnica_controller_1.getTds_schede_tecnica)
    .put(tds_schede_tecnica_controller_1.updateTds_schede_tecnica)
    .delete(tds_schede_tecnica_controller_1.deleteTds_schede_tecnica);
exports.default = tds_schede_tecnicaRoutes;
