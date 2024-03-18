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
exports.handleSchedeInApprovazionePage = void 0;
const cookies_1 = __importDefault(require("cookies"));
const authHelpers_1 = require("../helpers/authHelpers");
function handleSchedeInApprovazionePage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = new cookies_1.default(req, res);
        const jwt = cookies.get("jwt");
        if (!jwt) {
            // Handle if JWT cookie is not present
            return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
        }
        try {
            const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
            if (userType === 'admin' || userType === 'schedatore') {
                // User is either admin or schedatore
                res.render('schedeInApprovazione', { cssFilePath: '/styles/schedeInApprovazione.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/schedeInApprovazione.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
            }
            else {
                // User is neither admin nor schedatore
                res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
            }
        }
        catch (error) {
            console.error("Error during cookieChecker check:", error);
        }
    });
}
exports.handleSchedeInApprovazionePage = handleSchedeInApprovazionePage;
