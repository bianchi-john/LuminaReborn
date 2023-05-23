"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mostra_controller_1 = require("../controller/mostra.controller");
const mostraRoutes = (0, express_1.Router)();
mostraRoutes.route('/')
    .get(mostra_controller_1.getMostre)
    .post(mostra_controller_1.createMostra);
mostraRoutes.route('/:mostraId')
    .get(mostra_controller_1.getMostra)
    .put(mostra_controller_1.updateMostra)
    .delete(mostra_controller_1.deleteMostra);
exports.default = mostraRoutes;
