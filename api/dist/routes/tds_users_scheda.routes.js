"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_users_scheda_controller_1 = require("../controller/tds_users_scheda.controller");
const tds_users_schedaRoutes = (0, express_1.Router)();
tds_users_schedaRoutes.route('/')
    .get(tds_users_scheda_controller_1.getTds_users_schede)
    .post(tds_users_scheda_controller_1.createTds_users_scheda);
tds_users_schedaRoutes.route('/:tds_users_schedaId')
    .get(tds_users_scheda_controller_1.getTds_users_scheda)
    .put(tds_users_scheda_controller_1.updateTds_users_scheda)
    .delete(tds_users_scheda_controller_1.deleteTds_users_scheda);
exports.default = tds_users_schedaRoutes;
