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
exports.getUseData = exports.onlyAdmin = exports.cookieChecker = void 0;
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const cookies_1 = __importDefault(require("cookies"));
const axios_1 = __importDefault(require("axios"));
const cookieChecker = (jwt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('http://172.22.0.4/users/self', {
            params: { jwt }
        });
        if (response.status === 200) {
            const userData = response.data;
            // Controllo della data di creazione del token
            const creationTimestamp = new Date(userData.creation_date).getTime();
            const eightHoursAgo = new Date().getTime() - 8 * 60 * 60 * 1000;
            if (creationTimestamp < eightHoursAgo) {
                return false;
            }
            if (userData.isAdmin === true) {
                return 'admin';
            }
            else if (!userData.hasOwnProperty('isAdmin')) {
                return 'schedatore';
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
});
exports.cookieChecker = cookieChecker;
const onlyAdmin = (req, res, next, route) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = new cookies_1.default(req, res);
    const jwt = cookies.get('jwt');
    if (!jwt) {
        res
            .status(403)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
        return res.redirect('/');
    }
    try {
        const isAdminUser = yield (0, exports.cookieChecker)(jwt);
        if (isAdminUser) {
            route(req, res, next);
        }
        else {
            res
                .status(403)
                .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
        }
    }
    catch (error) {
        console.error('Error during cookieChecker check:', error);
        res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
});
exports.onlyAdmin = onlyAdmin;
const getJwtFromRequest = (req, res) => {
    try {
        const cookies = new cookies_1.default(req, res);
        const jwt = cookies.get('jwt');
        if (!jwt) {
            // If JWT is not found in cookies, handle it gracefully
            return false;
        }
        return jwt;
    }
    catch (error) {
        // If an error occurs, handle it and return undefined
        console.error('Error retrieving JWT:', error);
        res.status(403).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Errore nel recupero del JWT'));
        return undefined;
    }
};
const getUseData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let jwt = getJwtFromRequest(req, res);
    if (jwt) {
        try {
            const response = yield axios_1.default.get('http://172.22.0.4/users/self', {
                params: { jwt }
            });
            if (response.status === 200) {
                let userData = response.data;
                return userData;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.error('Non è stato possibile recuperare il nome utente dal sistema di gestione utenti:', error);
            res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            return false;
        }
    }
    else {
        return false;
    }
});
exports.getUseData = getUseData;
