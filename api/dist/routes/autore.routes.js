"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autore_controller_1 = require("../controller/autore.controller");
const autoreRoutes = (0, express_1.Router)();
autoreRoutes.route('/')
    .get(autore_controller_1.getAutori)
    .post(autore_controller_1.createAutore);
autoreRoutes.route('/:autoreId')
    .get(autore_controller_1.getAutore)
    .put(autore_controller_1.updateAutore)
    .delete(autore_controller_1.deleteAutore);
exports.default = autoreRoutes;
