"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const provenienza_controller_1 = require("../controller/provenienza.controller");
const provenienzaRoutes = (0, express_1.Router)();
provenienzaRoutes.route('/')
    .get(provenienza_controller_1.getProvenienze)
    .post(provenienza_controller_1.createProvenienza);
provenienzaRoutes.route('/:provenienzaId')
    .get(provenienza_controller_1.getProvenienza)
    .put(provenienza_controller_1.updateProvenienza)
    .delete(provenienza_controller_1.deleteProvenienza);
exports.default = provenienzaRoutes;
