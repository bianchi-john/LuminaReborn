"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const immagine_controller_1 = require("../controller/immagine.controller");
const immagineRoutes = (0, express_1.Router)();
immagineRoutes.route('/')
    .get(immagine_controller_1.getImmagini)
    .post(immagine_controller_1.createImmagine);
immagineRoutes.route('/:immagineId')
    .get(immagine_controller_1.getImmagine)
    .put(immagine_controller_1.updateImmagine)
    .delete(immagine_controller_1.deleteImmagine);
exports.default = immagineRoutes;
