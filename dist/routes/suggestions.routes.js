"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheda_controller_1 = require("../controller/scheda.controller");
const suggestionRoutes = (0, express_1.Router)();
suggestionRoutes.route('/')
    .get(scheda_controller_1.getSuggestions);
exports.default = suggestionRoutes;
