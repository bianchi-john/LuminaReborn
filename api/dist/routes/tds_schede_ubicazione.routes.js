"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_ubicazione_controller_1 = require("../controller/tds_schede_ubicazione.controller");
const tds_schede_ubicazioneRoutes = (0, express_1.Router)();
tds_schede_ubicazioneRoutes.route('/')
    .get(tds_schede_ubicazione_controller_1.getTds_schede_ubicazioni)
    .post(tds_schede_ubicazione_controller_1.createTds_schede_ubicazione);
tds_schede_ubicazioneRoutes.route('/:tds_schede_ubicazioneId')
    .get(tds_schede_ubicazione_controller_1.getTds_schede_ubicazione)
    .put(tds_schede_ubicazione_controller_1.updateTds_schede_ubicazione)
    .delete(tds_schede_ubicazione_controller_1.deleteTds_schede_ubicazione);
exports.default = tds_schede_ubicazioneRoutes;
