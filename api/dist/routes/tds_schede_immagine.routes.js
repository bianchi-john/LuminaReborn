"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_immagine_controller_1 = require("../controller/tds_schede_immagine.controller");
const tds_schede_immagineRoutes = (0, express_1.Router)();
tds_schede_immagineRoutes.route('/')
    .get(tds_schede_immagine_controller_1.getTds_schede_immagini)
    .post(tds_schede_immagine_controller_1.createTds_schede_immagine);
tds_schede_immagineRoutes.route('/:tds_schede_immagineId')
    .get(tds_schede_immagine_controller_1.getTds_schede_immagine)
    .put(tds_schede_immagine_controller_1.updateTds_schede_immagine)
    .delete(tds_schede_immagine_controller_1.deleteTds_schede_immagine);
exports.default = tds_schede_immagineRoutes;
