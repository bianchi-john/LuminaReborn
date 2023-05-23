"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ubicazione_controller_1 = require("../controller/ubicazione.controller");
const ubicazioneRoutes = (0, express_1.Router)();
ubicazioneRoutes.route('/')
    .get(ubicazione_controller_1.getUbicazioni)
    .post(ubicazione_controller_1.createUbicazione);
ubicazioneRoutes.route('/:ubicazioneId')
    .get(ubicazione_controller_1.getUbicazione)
    .put(ubicazione_controller_1.updateUbicazione)
    .delete(ubicazione_controller_1.deleteUbicazione);
exports.default = ubicazioneRoutes;
