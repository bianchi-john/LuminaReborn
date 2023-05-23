"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const misura_controller_1 = require("../controller/misura.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(misura_controller_1.getMisure)
    .post(misura_controller_1.createMisura);
misuraRoutes.route('/:misuraId')
    .get(misura_controller_1.getMisura)
    .put(misura_controller_1.updateMisura)
    .delete(misura_controller_1.deleteMisura);
exports.default = misuraRoutes;
