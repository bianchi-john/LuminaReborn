"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_gruppo_misura_controller_1 = require("../controller/tds_schede_gruppo_misura.controller");
const tds_schede_gruppo_misuraRoutes = (0, express_1.Router)();
tds_schede_gruppo_misuraRoutes.route('/')
    .get(tds_schede_gruppo_misura_controller_1.getTds_schede_gruppo_misure)
    .post(tds_schede_gruppo_misura_controller_1.createTds_schede_gruppo_misura);
tds_schede_gruppo_misuraRoutes.route('/:tds_schede_gruppo_misuraId')
    .get(tds_schede_gruppo_misura_controller_1.getTds_schede_gruppo_misura)
    .put(tds_schede_gruppo_misura_controller_1.updateTds_schede_gruppo_misura)
    .delete(tds_schede_gruppo_misura_controller_1.deleteTds_schede_gruppo_misura);
exports.default = tds_schede_gruppo_misuraRoutes;
