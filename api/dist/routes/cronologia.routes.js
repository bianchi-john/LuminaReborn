"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cronologia_controller_1 = require("../controller/cronologia.controller");
const cronologiaRoutes = (0, express_1.Router)();
cronologiaRoutes.route('/')
    .get(cronologia_controller_1.getCronologie)
    .post(cronologia_controller_1.createCronologia);
cronologiaRoutes.route('/:cronologiaId')
    .get(cronologia_controller_1.getCronologia)
    .put(cronologia_controller_1.updateCronologia)
    .delete(cronologia_controller_1.deleteCronologia);
exports.default = cronologiaRoutes;
