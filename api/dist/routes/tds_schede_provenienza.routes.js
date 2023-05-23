"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_provenienza_controller_1 = require("../controller/tds_schede_provenienza.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_provenienza_controller_1.getTds_schede_provenienze)
    .post(tds_schede_provenienza_controller_1.createTds_schede_provenienza);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_provenienza_controller_1.getTds_schede_provenienza)
    .put(tds_schede_provenienza_controller_1.updateTds_schede_provenienza)
    .delete(tds_schede_provenienza_controller_1.deleteTds_schede_provenienza);
exports.default = misuraRoutes;
