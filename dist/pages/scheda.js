"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSchedaPage = void 0;
// Load environment variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function handleSchedaPage(req, res) {
    res.render('scheda', { cssFilePath: '/styles/scheda.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/scheda.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', address: process.env });
}
exports.handleSchedaPage = handleSchedaPage;
