"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_materiale_controller_1 = require("../controller/tds_schede_materiale.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_materiale_controller_1.getTds_schede_materiali)
    .post(tds_schede_materiale_controller_1.createTds_schede_materiale);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_materiale_controller_1.getTds_schede_materiale)
    .put(tds_schede_materiale_controller_1.updateTds_schede_materiale)
    .delete(tds_schede_materiale_controller_1.deleteTds_schede_materiale);
exports.default = misuraRoutes;
