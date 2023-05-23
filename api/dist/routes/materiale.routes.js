"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materiale_controller_1 = require("../controller/materiale.controller");
const materialeRoutes = (0, express_1.Router)();
materialeRoutes.route('/')
    .get(materiale_controller_1.getMateriali)
    .post(materiale_controller_1.createMateriale);
materialeRoutes.route('/:materialeId')
    .get(materiale_controller_1.getMateriale)
    .put(materiale_controller_1.updateMateriale)
    .delete(materiale_controller_1.deleteMateriale);
exports.default = materialeRoutes;
