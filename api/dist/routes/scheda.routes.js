"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheda_controller_1 = require("../controller/scheda.controller");
const schedaRoutes = (0, express_1.Router)();
schedaRoutes.route('/')
    .get(scheda_controller_1.getSchede)
    .post(scheda_controller_1.createScheda);
schedaRoutes.route('/:schedaId')
    .get(scheda_controller_1.getScheda)
    .put(scheda_controller_1.updateScheda)
    .delete(scheda_controller_1.deleteScheda);
exports.default = schedaRoutes;
