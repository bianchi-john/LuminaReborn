"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_inventario_controller_1 = require("../controller/tds_schede_inventario.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_inventario_controller_1.getTds_schede_inventari)
    .post(tds_schede_inventario_controller_1.createTds_schede_inventario);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_inventario_controller_1.getTds_schede_inventario)
    .put(tds_schede_inventario_controller_1.updateTds_schede_inventario)
    .delete(tds_schede_inventario_controller_1.deleteTds_schede_inventario);
exports.default = misuraRoutes;
