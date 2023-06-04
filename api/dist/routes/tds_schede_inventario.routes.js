"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_inventario_controller_1 = require("../controller/tds_schede_inventario.controller");
const tds_schede_inventarioRoutes = (0, express_1.Router)();
tds_schede_inventarioRoutes.route('/')
    .get(tds_schede_inventario_controller_1.getTds_schede_inventari)
    .post(tds_schede_inventario_controller_1.createTds_schede_inventario);
tds_schede_inventarioRoutes.route('/:tds_schede_inventarioId')
    .get(tds_schede_inventario_controller_1.getTds_schede_inventario)
    .put(tds_schede_inventario_controller_1.updateTds_schede_inventario)
    .delete(tds_schede_inventario_controller_1.deleteTds_schede_inventario);
exports.default = tds_schede_inventarioRoutes;
