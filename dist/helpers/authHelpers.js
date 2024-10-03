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
exports.getUseData = exports.onlyAdmin = exports.onlySchedatore = exports.cookieChecker = void 0;
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const cookies_1 = __importDefault(require("cookies"));
const axios_1 = __importDefault(require("axios"));
// Funzione di controllo del cookie
const cookieChecker = (jwt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('http://192.168.0.4/users/self', {
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
// Controllo dei privilegi a livello di route e non di pagina
const onlySchedatore = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = new cookies_1.default(req, res);
    const jwt = cookies.get('jwt');
    if (!jwt) {
        return res.status(401).send('Accesso negato. JWT mancante.');
    }
    try {
        const result = yield (0, exports.cookieChecker)(jwt);
        if (result === 'schedatore') {
            next(); // Se il risultato è 'schedatore', procedi alla route successiva
        }
        else {
            res.status(403).send('Accesso negato. Non autorizzato.');
        }
    }
    catch (error) {
        res.status(500).send('Errore del server.');
    }
});
exports.onlySchedatore = onlySchedatore;
// Controllo dei privilegi a livello di route e non di pagina
const onlyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = new cookies_1.default(req, res);
    const jwt = cookies.get('jwt');
    if (!jwt) {
        return res.status(401).send('Accesso negato. JWT mancante.');
    }
    try {
        const result = yield (0, exports.cookieChecker)(jwt);
        if (result === 'admin') {
            next(); // Se il risultato è 'schedatore', procedi alla route successiva
        }
        else {
            res.status(403).send('Accesso negato. Non autorizzato.');
        }
    }
    catch (error) {
        res.status(500).send('Errore del server.');
    }
});
exports.onlyAdmin = onlyAdmin;
// Ottengo il cooke di autenticazione dal client
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
// Capisco che tipo di user è il client dal suo token di autenticazione
const getUseData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let jwt = getJwtFromRequest(req, res);
    if (jwt) {
        try {
            const response = yield axios_1.default.get('http://192.168.0.4/users/self', {
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
