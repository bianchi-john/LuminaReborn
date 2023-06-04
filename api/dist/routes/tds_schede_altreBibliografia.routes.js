"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tds_schede_altreBibliografia_controller_1 = require("../controller/tds_schede_altreBibliografia.controller");
const tds_schede_altreBibliografiaRoutes = (0, express_1.Router)();
tds_schede_altreBibliografiaRoutes.route('/')
    .get(tds_schede_altreBibliografia_controller_1.getTds_schede_altreBibliografie)
    .post(tds_schede_altreBibliografia_controller_1.createTds_schede_altreBibliografia);
tds_schede_altreBibliografiaRoutes.route('/:tds_schede_altreBibliografiaId')
    .get(tds_schede_altreBibliografia_controller_1.getTds_schede_altreBibliografia)
    .put(tds_schede_altreBibliografia_controller_1.updateTds_schede_altreBibliografia)
    .delete(tds_schede_altreBibliografia_controller_1.deleteTds_schede_altreBibliografia);
exports.default = tds_schede_altreBibliografiaRoutes;
