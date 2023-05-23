"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_mostra_controller_1 = require("../controller/tds_schede_mostra.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_mostra_controller_1.getTds_schede_mostre)
    .post(tds_schede_mostra_controller_1.createTds_schede_mostra);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_mostra_controller_1.getTds_schede_mostra)
    .put(tds_schede_mostra_controller_1.updateTds_schede_mostra)
    .delete(tds_schede_mostra_controller_1.deleteTds_schede_mostra);
exports.default = misuraRoutes;
