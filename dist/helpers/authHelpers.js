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
exports.getUserData = exports.onlyAdmin = exports.onlySchedatore = exports.cookieChecker = void 0;
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const cookies_1 = __importDefault(require("cookies"));
const axios_1 = __importDefault(require("axios"));
// Funzione di controllo del cookie
const cookieChecker = (jwt) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`cookieChecker: Checking cookie with JWT: ${jwt}`);
    try {
        const response = yield axios_1.default.get('http://192.168.0.4/users/self', {
            params: { jwt }
        });
        if (response.status === 200) {
            const userData = response.data;
            // Fixare bug della data (pensa che sia stato creato il giorno prima il cookie)
            // console.log(`cookieChecker: User data retrieved - Creation Date: ${userData.creation_date}, isAdmin: ${userData.isAdmin}`);
            // // Estrai il timestamp di creazione in UTC
            // const creationTimestamp = new Date(userData.creation_date).getTime();
            // // Calcola esattamente 8 ore fa rispetto all'orario attuale, senza fuso orario
            // const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;
            // // Ora confronta se il token è più vecchio di 8 ore
            // if (creationTimestamp < eightHoursAgo) {
            //   console.log('cookieChecker: Token expired - more than 8 hours old.');
            //   return false;
            // }
            if (userData.isAdmin === true) {
                console.log('cookieChecker: User is an admin.');
                return 'admin';
            }
            else if (!userData.hasOwnProperty('isAdmin')) {
                console.log('cookieChecker: User is a schedatore.');
                return 'schedatore';
            }
            else {
                console.log('cookieChecker: User is neither admin nor schedatore.');
                return false;
            }
        }
        else {
            console.log('cookieChecker: User data retrieval failed.');
            return false;
        }
    }
    catch (error) {
        console.error('cookieChecker: Error while checking cookie:', error);
        return false;
    }
});
exports.cookieChecker = cookieChecker;
// Controllo dei privilegi a livello di route e non di pagina
const onlySchedatore = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = new cookies_1.default(req, res);
    const jwt = cookies.get('jwt');
    console.log(`onlySchedatore: Checking schedatore privileges with JWT: ${jwt}`);
    if (!jwt) {
        console.log('onlySchedatore: JWT missing.');
        return res.status(401).send('Accesso negato. JWT mancante.');
    }
    try {
        const result = yield (0, exports.cookieChecker)(jwt);
        if (result === 'schedatore') {
            console.log('onlySchedatore: Access granted to schedatore.');
            next(); // Se il risultato è 'schedatore', procedi alla route successiva
        }
        else {
            console.log('onlySchedatore: Access denied - not schedatore.');
            res.status(403).send('Accesso negato. Non autorizzato.');
        }
    }
    catch (error) {
        console.error('onlySchedatore: Server error occurred:', error);
        res.status(500).send('Errore del server.');
    }
});
exports.onlySchedatore = onlySchedatore;
// Controllo dei privilegi a livello di route e non di pagina
const onlyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = new cookies_1.default(req, res);
    const jwt = cookies.get('jwt');
    console.log(`onlyAdmin: Checking admin privileges with JWT: ${jwt}`);
    if (!jwt) {
        console.log('onlyAdmin: JWT missing.');
        return res.status(401).send('Accesso negato. JWT mancante.');
    }
    try {
        const result = yield (0, exports.cookieChecker)(jwt);
        if (result === 'admin') {
            console.log('onlyAdmin: Access granted to admin.');
            next(); // Se il risultato è 'admin', procedi alla route successiva
        }
        else {
            console.log('onlyAdmin: Access denied - not admin.');
            res.status(403).send('Accesso negato. Non autorizzato.');
        }
    }
    catch (error) {
        console.error('onlyAdmin: Server error occurred:', error);
        res.status(500).send('Errore del server.');
    }
});
exports.onlyAdmin = onlyAdmin;
// Ottengo il cookie di autenticazione dal client
const getJwtFromRequest = (req, res) => {
    try {
        const cookies = new cookies_1.default(req, res);
        const jwt = cookies.get('jwt');
        console.log(`getJwtFromRequest: Retrieved JWT: ${jwt}`);
        if (!jwt) {
            console.log('getJwtFromRequest: JWT not found in cookies.');
            return false;
        }
        return jwt;
    }
    catch (error) {
        console.error('getJwtFromRequest: Error retrieving JWT:', error);
        res.status(403).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Errore nel recupero del JWT'));
        return undefined;
    }
};
// Capisco che tipo di user è il client dal suo token di autenticazione
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let jwt = getJwtFromRequest(req, res);
    console.log(`getUserData: Retrieved JWT for user data: ${jwt}`);
    if (jwt) {
        try {
            const response = yield axios_1.default.get('http://192.168.0.4/users/self', {
                params: { jwt }
            });
            if (response.status === 200) {
                let userData = response.data;
                console.log(`getUserData: User data retrieved - User: ${userData.username}`);
                return userData;
            }
            else {
                console.log('getUserData: Failed to retrieve user data.');
                return false;
            }
        }
        catch (error) {
            console.error('getUserData: Error retrieving user data:', error);
            res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            return false;
        }
    }
    else {
        console.log('getUserData: JWT not available, cannot retrieve user data.');
        return false;
    }
});
exports.getUserData = getUserData;
