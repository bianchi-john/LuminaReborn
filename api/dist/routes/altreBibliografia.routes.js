"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const altreBibliografia_controller_1 = require("../controller/altreBibliografia.controller");
const bibliografiaRoutes = (0, express_1.Router)();
bibliografiaRoutes.route('/')
    .get(altreBibliografia_controller_1.getAltreBibliografie)
    .post(altreBibliografia_controller_1.createAltreBibliografia);
bibliografiaRoutes.route('/:altreBibliografiaId')
    .get(altreBibliografia_controller_1.getAltreBibliografia)
    .put(altreBibliografia_controller_1.updateAltreBibliografia)
    .delete(altreBibliografia_controller_1.deleteAltreBibliografia);
exports.default = bibliografiaRoutes;
