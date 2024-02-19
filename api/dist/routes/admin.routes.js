"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controller/admin.controller");
const adminRoutes = (0, express_1.Router)();
adminRoutes.route('/')
    .get(admin_controller_1.getBozzeForAdmin)
    .post(admin_controller_1.approveScheda)
    .delete(admin_controller_1.rejectBozza);
adminRoutes.route('/:schedaId')
    .get(admin_controller_1.getBozza);
exports.default = adminRoutes;
