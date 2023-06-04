"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_bibliografia_controller_1 = require("../controller/tds_schede_bibliografia.controller");
const tds_schede_bibliografiaRoutes = (0, express_1.Router)();
tds_schede_bibliografiaRoutes.route('/')
    .get(tds_schede_bibliografia_controller_1.getTds_schede_bibliografie)
    .post(tds_schede_bibliografia_controller_1.createTds_schede_bibliografia);
tds_schede_bibliografiaRoutes.route('/:tds_schede_bibliografiaId')
    .get(tds_schede_bibliografia_controller_1.getTds_schede_bibliografia)
    .put(tds_schede_bibliografia_controller_1.updateTds_schede_bibliografia)
    .delete(tds_schede_bibliografia_controller_1.deleteTds_schede_bibliografia);
exports.default = tds_schede_bibliografiaRoutes;
