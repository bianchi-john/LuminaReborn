"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedatore_controller_1 = require("../controller/schedatore.controller");
const schedatoreRoutes = (0, express_1.Router)();
schedatoreRoutes.route('/')
    .get(schedatore_controller_1.getSchedeForSchedatore)
    .delete(schedatore_controller_1.deleteSchedaForSchedatore)
    .post(schedatore_controller_1.schedaToAdmin);
exports.default = schedatoreRoutes;
