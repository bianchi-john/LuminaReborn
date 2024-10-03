"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValutaBozzaPage = void 0;
// Load environment variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function handleValutaBozzaPage(req, res) {
    res.render('valutaBozza', { cssFilePath: '/styles/scheda.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/valutaBozza.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', address: process.env });
}
exports.handleValutaBozzaPage = handleValutaBozzaPage;
