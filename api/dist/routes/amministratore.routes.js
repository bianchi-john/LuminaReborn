"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const amministratore_controller_1 = require("../controller/amministratore.controller");
const amminsitratoreRoutes = (0, express_1.Router)();
amminsitratoreRoutes.route('/')
    .get(amministratore_controller_1.getSchedeForAmministratore);
exports.default = amminsitratoreRoutes;
