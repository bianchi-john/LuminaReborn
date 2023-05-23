"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventario_controler_1 = require("../controller/inventario.controler");
const inventarioRoutes = (0, express_1.Router)();
inventarioRoutes.route('/')
    .get(inventario_controler_1.getInventari)
    .post(inventario_controler_1.createInventario);
inventarioRoutes.route('/:inventarioId')
    .get(inventario_controler_1.getInventario)
    .put(inventario_controler_1.updateInventario)
    .delete(inventario_controler_1.deleteInventario);
exports.default = inventarioRoutes;
