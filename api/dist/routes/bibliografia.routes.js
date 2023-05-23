"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bibliografia_controller_1 = require("../controller/bibliografia.controller");
const bibliografiaRoutes = (0, express_1.Router)();
bibliografiaRoutes.route('/')
    .get(bibliografia_controller_1.getBibliografie)
    .post(bibliografia_controller_1.createBibliografia);
bibliografiaRoutes.route('/:bibliografiaId')
    .get(bibliografia_controller_1.getBibliografia)
    .put(bibliografia_controller_1.updateBibliografia)
    .delete(bibliografia_controller_1.deleteBibliografia);
exports.default = bibliografiaRoutes;
