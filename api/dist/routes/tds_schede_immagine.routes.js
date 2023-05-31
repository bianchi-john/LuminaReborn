"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_immagine_controller_1 = require("../controller/tds_schede_immagine.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_immagine_controller_1.getTds_schede_immagini)
    .post(tds_schede_immagine_controller_1.createTds_schede_immagine);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_immagine_controller_1.getTds_schede_immagine)
    .put(tds_schede_immagine_controller_1.updateTds_schede_immagine)
    .delete(tds_schede_immagine_controller_1.deleteTds_schede_immagine);
exports.default = misuraRoutes;
