"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_cronologia_controller_1 = require("../controller/tds_schede_cronologia.controller");
const tds_schede_cronologiaRoutes = (0, express_1.Router)();
tds_schede_cronologiaRoutes.route('/')
    .get(tds_schede_cronologia_controller_1.getTds_schede_cronologie)
    .post(tds_schede_cronologia_controller_1.createTds_schede_cronologia);
tds_schede_cronologiaRoutes.route('/:tds_schede_cronologiaId')
    .get(tds_schede_cronologia_controller_1.getTds_schede_cronologia)
    .put(tds_schede_cronologia_controller_1.updateTds_schede_cronologia)
    .delete(tds_schede_cronologia_controller_1.deleteTds_schede_cronologia);
exports.default = tds_schede_cronologiaRoutes;
