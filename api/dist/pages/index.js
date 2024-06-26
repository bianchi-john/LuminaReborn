"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIndexPage = void 0;
const authHelpers_1 = require("../helpers/authHelpers");
const cookies_1 = __importDefault(require("cookies"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function handleIndexPage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = new cookies_1.default(req, res);
        const jwt = cookies.get("jwt");
        if (!jwt) {
            // Il cookie JWT non è presente, gestisci di conseguenza
            return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null, address: process.env });
        }
        try {
            const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
            if (userType === 'admin') {
                // L'utente è un amministratore
                res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: 'admin', address: process.env });
            }
            else if (userType === 'schedatore') {
                // L'utente è uno schedatore
                res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: 'schedatore', address: process.env });
            }
            else {
                // L'utente non è né amministratore né schedatore
                res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null, address: process.env });
            }
        }
        catch (error) {
            console.error("Error during cookieChecker check:", error);
        }
    });
}
exports.handleIndexPage = handleIndexPage;
