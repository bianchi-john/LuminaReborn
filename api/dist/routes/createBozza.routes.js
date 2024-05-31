"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheda_controller_1 = require("../controller/scheda.controller");
const createBozzaRoutes = (0, express_1.Router)();
createBozzaRoutes.route('/')
    .post(scheda_controller_1.createScheda);
exports.default = createBozzaRoutes;
