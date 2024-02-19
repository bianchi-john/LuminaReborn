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
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const response_1 = require("./domain/response");
const code_enum_1 = require("./enum/code.enum");
const status_enum_1 = require("./enum/status.enum");
const cookies_1 = __importDefault(require("cookies"));
const ip_1 = __importDefault(require("ip"));
const cors_1 = __importDefault(require("cors"));
const scheda_routes_1 = __importDefault(require("./routes/scheda.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const schedatore_routes_1 = __importDefault(require("./routes/schedatore.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const process_1 = __importDefault(require("process"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path")); // Aggiunto il modulo 'path' per gestire i percorsi dei file
const authHelpers_1 = require("./helpers/authHelpers"); // Importa le funzioni dal modulo
const viewsPath = path_1.default.join(__dirname, './views'); // Cartella contenente i file HTML
class App {
    constructor(port = process_1.default.env.SERVER_PORT || 3000) {
        this.port = port;
        this.APPLICATION_RUNNING = 'application is running on:';
        this.ROUTE_NOT_FOUND = 'Route does not exist on the server.';
        this.app = (0, express_1.default)();
        this.middleWare();
        this.routes();
        this.nodeOptions = ['--max-old-space-size=4096'];
    }
    listen() {
        process_1.default.env.NODE_OPTIONS = '--max-old-space-size=4096'; // Imposta le opzioni del nodo
        this.app.listen(this.port);
        console.info(`${this.APPLICATION_RUNNING} ${ip_1.default.address()}:${this.port}`);
        console.info(`${this.APPLICATION_RUNNING} ${ip_1.default.address()}:${this.port}`);
    }
    middleWare() {
        this.app.use((0, cors_1.default)({ origin: '*' }));
        this.app.use(express_1.default.json({ limit: '500mb' })); // Imposta il limite della richiesta JSON a 50 MB
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true })); // Imposta il limite della richiesta URL codificata a 50 MB
        this.app.use(express_1.default.json());
        this.app.set('views', viewsPath);
        this.app.set('view engine', 'ejs');
    }
    routes() {
        const authOptions = { url: 'http://172.22.0.2' };
        // SERVICES
        this.app.use('/schede', scheda_routes_1.default);
        this.app.use('/search', search_routes_1.default);
        this.app.use('/manageBozze', schedatore_routes_1.default);
        this.app.use('/admin', admin_routes_1.default);
        // PAGES, SCRIPTS AND STYLES
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        this.app.use('/styles', express_1.default.static(path_1.default.join(__dirname, 'views/styles')));
        this.app.use('/scripts', express_1.default.static(path_1.default.join(__dirname, 'views/scripts')));
        this.app.use('/img', express_1.default.static(path_1.default.join(__dirname, 'views/img')));
        // Nella route per la pagina index
        this.app.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = new cookies_1.default(req, res);
            const jwt = cookies.get("jwt");
            if (!jwt) {
                // Il cookie JWT non è presente, gestisci di conseguenza
                return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
            }
            try {
                const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
                if (userType === 'admin') {
                    // L'utente è un amministratore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: 'admin' });
                }
                else if (userType === 'schedatore') {
                    // L'utente è uno schedatore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: 'schedatore' });
                }
                else {
                    // L'utente non è né amministratore né schedatore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
                }
            }
            catch (error) {
                console.error("Error during cookieChecker check:", error);
                return res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            }
        }));
        // SCHEDA
        this.app.get('/scheda', (req, res) => {
            res.render('scheda', { cssFilePath: '/styles/scheda.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/scheda.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
        });
        //LOGIN
        this.app.get('/login', (req, res) => {
            res.render('login', { cssFilePath: '/styles/login.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/login.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
        });
        this.app.post('/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const data = {
                username: username,
                password: password
            };
            try {
                const response = yield axios_1.default.post('http://172.22.0.4/auth/login', JSON.stringify(data), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    const result = response.data;
                    // Salva il token JWT in un cookie
                    res.cookie('jwt', result.jwt, { path: '/' });
                    res.status(200).send({ success: true });
                }
                else {
                    res.status(response.status).send(response.data);
                }
            }
            catch (error) {
                console.error('Error during login:', error);
                res.status(500).send(error);
            }
        }));
        // BOZZE
        this.app.get('/bozze', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = new cookies_1.default(req, res);
            const jwt = cookies.get("jwt");
            if (!jwt) {
                // Il cookie JWT non è presente, gestisci di conseguenza
                return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
            }
            try {
                const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
                if (userType === 'admin' || userType === 'schedatore') {
                    // L'utente è un amministratore o schedaotore
                    res.render('bozze', { cssFilePath: '/styles/bozze.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/bozze.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
                }
                else {
                    // L'utente non è né amministratore né schedatore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
                }
            }
            catch (error) {
                console.error("Error during cookieChecker check:", error);
                return res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            }
        }));
        // SCHEDE IN APPROVAZIONE
        this.app.get('/schedeInApprovazione', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = new cookies_1.default(req, res);
            const jwt = cookies.get("jwt");
            if (!jwt) {
                // Il cookie JWT non è presente, gestisci di conseguenza
                return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
            }
            try {
                const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
                if (userType === 'admin' || userType === 'schedatore') {
                    // L'utente è un amministratore o schedaotore
                    res.render('schedeInApprovazione', { cssFilePath: '/styles/schedeInApprovazione.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/schedeInApprovazione.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
                }
                else {
                    // L'utente non è né amministratore né schedatore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
                }
            }
            catch (error) {
                console.error("Error during cookieChecker check:", error);
                return res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            }
        }));
        // AMMINISTRATORE
        this.app.get('/amministratore', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = new cookies_1.default(req, res);
            const jwt = cookies.get("jwt");
            if (!jwt) {
                // Il cookie JWT non è presente, gestisci di conseguenza
                return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
            }
            try {
                const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
                if (userType === 'admin') {
                    // L'utente è un amministratore
                    res.render('amministratore', { cssFilePath: '/styles/amministratore.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/amministratore.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
                }
                else {
                    // L'utente non è né amministratore né schedatore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
                }
            }
            catch (error) {
                console.error("Error during cookieChecker check:", error);
                return res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            }
        }));
        // BOZZAEDITOR
        this.app.get('/bozzaEditor', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = new cookies_1.default(req, res);
            const jwt = cookies.get("jwt");
            if (!jwt) {
                // Il cookie JWT non è presente, gestisci di conseguenza
                return res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: null });
            }
            try {
                const userType = yield (0, authHelpers_1.cookieChecker)(jwt);
                if (userType === 'admin' || userType === 'schedatore') {
                    // L'utente è un amministratore o schedaotore
                    res.render('bozzaEditor', { richTextScript: '/scripts/richText.js', richTextStyle: '/styles/richText.css', cssFilePath: '/styles/bozzaEditor.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/bozzaEditor.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
                }
                else {
                    // L'utente non è né amministratore né schedatore
                    res.render('index', { cssFilePath: '/styles/index.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/index.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img', userType: userType });
                }
            }
            catch (error) {
                console.error("Error during cookieChecker check:", error);
                return res.status(500).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
            }
        }));
        // APPROVA BOZZA
        this.app.get('/valutaBozza', (req, res) => {
            res.render('valutaBozza', { cssFilePath: '/styles/scheda.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/valutaBozza.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
        });
        this.app.all('*', (_, res) => res.status(code_enum_1.Code.NOT_FOUND).send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
    }
}
exports.App = App;
