"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_altreBibliografia_controller_1 = require("../controller/tds_schede_altreBibliografia.controller");
const misuraRoutes = (0, express_1.Router)();
misuraRoutes.route('/')
    .get(tds_schede_altreBibliografia_controller_1.getTds_schede_altreBibliografie)
    .post(tds_schede_altreBibliografia_controller_1.createTds_schede_altreBibliografia);
misuraRoutes.route('/:misuraId')
    .get(tds_schede_altreBibliografia_controller_1.getTds_schede_altreBibliografia)
    .put(tds_schede_altreBibliografia_controller_1.updateTds_schede_altreBibliografia)
    .delete(tds_schede_altreBibliografia_controller_1.deleteTds_schede_altreBibliografia);
exports.default = misuraRoutes;
