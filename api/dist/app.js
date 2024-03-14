"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const response_1 = require("./domain/response");
const code_enum_1 = require("./enum/code.enum");
const status_enum_1 = require("./enum/status.enum");
const ip_1 = __importDefault(require("ip"));
const cors_1 = __importDefault(require("cors"));
const scheda_routes_1 = __importDefault(require("./routes/scheda.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const schedatore_routes_1 = __importDefault(require("./routes/schedatore.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const suggestions_routes_1 = __importDefault(require("./routes/suggestions.routes"));
const index_1 = require("./pages/index");
const scheda_1 = require("./pages/scheda");
const login_1 = require("./pages/login");
const bozze_1 = require("./pages/bozze");
const schedeInApprovazione_1 = require("./pages/schedeInApprovazione");
const amministratore_1 = require("./pages/amministratore");
const bozzaEditor_1 = require("./pages/bozzaEditor");
const valutaBozza_1 = require("./pages/valutaBozza");
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path")); // Aggiunto il modulo 'path' per gestire i percorsi dei file
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
    // ROUTES
    middleWare() {
        this.app.use((0, cors_1.default)({ origin: '*' }));
        this.app.use(express_1.default.json({ limit: '500mb' })); // Imposta il limite della richiesta JSON a 50 MB
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true })); // Imposta il limite della richiesta URL codificata a 50 MB
        this.app.use(express_1.default.json());
        this.app.set('views', viewsPath);
        this.app.set('view engine', 'ejs');
        this.app.use('/styles', express_1.default.static(path_1.default.join(__dirname, 'views', 'styles')));
        this.app.use('/scripts', express_1.default.static(path_1.default.join(__dirname, 'views', 'scripts')));
        this.app.use('/img', express_1.default.static(path_1.default.join(__dirname, 'views', 'img')));
    }
    routes() {
        // PAGES
        this.app.get('/', index_1.handleIndexPage);
        this.app.get('/scheda', scheda_1.handleSchedaPage);
        this.app.get('/login', login_1.handleLoginPage);
        this.app.post('/login', login_1.handleLoginPost);
        this.app.get('/bozze', bozze_1.handleBozzePage);
        this.app.get('/schedeInApprovazione', schedeInApprovazione_1.handleSchedeInApprovazionePage);
        this.app.get('/amministratore', amministratore_1.handleAmministratorePage);
        this.app.get('/bozzaEditor', bozzaEditor_1.handleBozzaEditorPage);
        this.app.get('/valutaBozza', valutaBozza_1.handleValutaBozzaPage);
        // SERVICES
        const authOptions = { url: process_1.default.env.AUTH_URL };
        this.app.use('/schede', scheda_routes_1.default);
        this.app.use('/search', search_routes_1.default);
        this.app.use('/manageBozze', schedatore_routes_1.default);
        this.app.use('/admin', admin_routes_1.default);
        this.app.use('/suggestions', suggestions_routes_1.default);
        // 404 Not Found
        this.app.all('*', (_, res) => res.status(code_enum_1.Code.NOT_FOUND).send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
    }
}
exports.App = App;
