"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_materiale_controller_1 = require("../controller/tds_schede_materiale.controller");
const tds_schede_materialeRoutes = (0, express_1.Router)();
tds_schede_materialeRoutes.route('/')
    .get(tds_schede_materiale_controller_1.getTds_schede_materiali)
    .post(tds_schede_materiale_controller_1.createTds_schede_materiale);
tds_schede_materialeRoutes.route('/:tds_schede_materialeId')
    .get(tds_schede_materiale_controller_1.getTds_schede_materiale)
    .put(tds_schede_materiale_controller_1.updateTds_schede_materiale)
    .delete(tds_schede_materiale_controller_1.deleteTds_schede_materiale);
exports.default = tds_schede_materialeRoutes;
