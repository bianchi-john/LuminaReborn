"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("../controller/search.controller");
const searchRoutes = (0, express_1.Router)();
searchRoutes.route('/')
    .get(search_controller_1.genericSearch);
exports.default = searchRoutes;
