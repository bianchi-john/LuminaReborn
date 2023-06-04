"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_autore_controller_1 = require("../controller/tds_schede_autore.controller");
const tds_schede_autoreRoutes = (0, express_1.Router)();
tds_schede_autoreRoutes.route('/')
    .get(tds_schede_autore_controller_1.getTds_schede_autori)
    .post(tds_schede_autore_controller_1.createTds_schede_autore);
tds_schede_autoreRoutes.route('/:tds_schede_autoreId')
    .get(tds_schede_autore_controller_1.getTds_schede_autore)
    .put(tds_schede_autore_controller_1.updateTds_schede_autore)
    .delete(tds_schede_autore_controller_1.deleteTds_schede_autore);
exports.default = tds_schede_autoreRoutes;
