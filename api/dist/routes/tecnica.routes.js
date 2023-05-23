"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tecnica_controller_1 = require("../controller/tecnica.controller");
const tecnicaRoutes = (0, express_1.Router)();
tecnicaRoutes.route('/')
    .get(tecnica_controller_1.getTecniche)
    .post(tecnica_controller_1.createTecnica);
tecnicaRoutes.route('/:tecnicaId')
    .get(tecnica_controller_1.getTecnica)
    .put(tecnica_controller_1.updateTecnica)
    .delete(tecnica_controller_1.deleteTecnica);
exports.default = tecnicaRoutes;
