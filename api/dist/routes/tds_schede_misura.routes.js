"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_misura_controller_1 = require("../controller/tds_schede_misura.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_misura_controller_1.getTds_schede_misure)
    .post(tds_schede_misura_controller_1.createTds_schede_misura);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_misura_controller_1.getTds_schede_misura)
    .put(tds_schede_misura_controller_1.updateTds_schede_misura)
    .delete(tds_schede_misura_controller_1.deleteTds_schede_misura);
exports.default = misuraRoutes;
