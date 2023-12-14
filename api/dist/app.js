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
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const scheda_routes_1 = __importDefault(require("./routes/scheda.routes"));
const bibliografia_routes_1 = __importDefault(require("./routes/bibliografia.routes"));
const documentazioneFotografica_routes_1 = __importDefault(require("./routes/documentazioneFotografica.routes"));
const altreBibliografia_routes_1 = __importDefault(require("./routes/altreBibliografia.routes"));
const inventario_routes_1 = __importDefault(require("./routes/inventario.routes"));
const materiale_routes_1 = __importDefault(require("./routes/materiale.routes"));
const misura_routes_1 = __importDefault(require("./routes/misura.routes"));
const mostra_routes_1 = __importDefault(require("./routes/mostra.routes"));
const cronologia_routes_1 = __importDefault(require("./routes/cronologia.routes"));
const provenienza_routes_1 = __importDefault(require("./routes/provenienza.routes"));
const tds_schede_bibliografia_routes_1 = __importDefault(require("./routes/tds_schede_bibliografia.routes"));
const tds_schede_altreBibliografia_routes_1 = __importDefault(require("./routes/tds_schede_altreBibliografia.routes"));
const tds_schede_inventario_routes_1 = __importDefault(require("./routes/tds_schede_inventario.routes"));
const tds_schede_materiale_routes_1 = __importDefault(require("./routes/tds_schede_materiale.routes"));
const tds_schede_misura_routes_1 = __importDefault(require("./routes/tds_schede_misura.routes"));
const tds_schede_gruppo_misure_routes_1 = __importDefault(require("./routes/tds_schede_gruppo_misure.routes"));
const tds_schede_mostra_routes_1 = __importDefault(require("./routes/tds_schede_mostra.routes"));
const tds_schede_cronologia_routes_1 = __importDefault(require("./routes/tds_schede_cronologia.routes"));
const tds_schede_provenienza_routes_1 = __importDefault(require("./routes/tds_schede_provenienza.routes"));
const tds_schede_tecnica_routes_1 = __importDefault(require("./routes/tds_schede_tecnica.routes"));
const tds_schede_ubicazione_routes_1 = __importDefault(require("./routes/tds_schede_ubicazione.routes"));
const tds_users_scheda_routes_1 = __importDefault(require("./routes/tds_users_scheda.routes"));
const tds_schede_documentazioneFotografica_routes_1 = __importDefault(require("./routes/tds_schede_documentazioneFotografica.routes"));
const tecnica_routes_1 = __importDefault(require("./routes/tecnica.routes"));
const ubicazione_routes_1 = __importDefault(require("./routes/ubicazione.routes"));
const autore_routes_1 = __importDefault(require("./routes/autore.routes"));
const immagine_routes_1 = __importDefault(require("./routes/immagine.routes"));
const tds_schede_autore_routes_1 = __importDefault(require("./routes/tds_schede_autore.routes"));
const tds_schede_immagine_routes_1 = __importDefault(require("./routes/tds_schede_immagine.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const express_identification_middleware_1 = __importDefault(require("@moreillon/express_identification_middleware"));
const process_1 = __importDefault(require("process"));
const axios_1 = __importDefault(require("axios"));
const isAdmin = (jwt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('http://172.22.0.2/proxy/api/users', {
            params: { jwt }
        });
        // Se la richiesta alla risorsa degli utenti ha successo (200), considera l'utente un amministratore
        return response.status === 200;
    }
    catch (error) {
        // Se la richiesta fallisce con un 403, considera l'utente non un amministratore
        return false;
    }
});
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
        this.app.use(express_1.default.json());
    }
    routes() {
        const authOptions = { url: 'http://172.22.0.2' };
        this.app.use('/users', user_routes_1.default);
        this.app.use('/schede', scheda_routes_1.default);
        this.app.use('/bibliografie', bibliografia_routes_1.default);
        this.app.use('/altreBibliografie', altreBibliografia_routes_1.default);
        this.app.use('/inventari', inventario_routes_1.default);
        this.app.use('/materiali', materiale_routes_1.default);
        this.app.use('/misure', misura_routes_1.default);
        this.app.use('/mostre', mostra_routes_1.default);
        this.app.use('/cronologie', cronologia_routes_1.default);
        this.app.use('/provenienze', provenienza_routes_1.default);
        this.app.use('/schede', scheda_routes_1.default);
        this.app.use('/documentazioniFotografiche', documentazioneFotografica_routes_1.default);
        this.app.use('/tds_schede_bibliografie', tds_schede_bibliografia_routes_1.default);
        this.app.use('/tds_schede_documentazioniFotografiche', tds_schede_documentazioneFotografica_routes_1.default);
        this.app.use('/tds_schede_altreBibliografie', tds_schede_altreBibliografia_routes_1.default);
        this.app.use('/tds_schede_inventari', tds_schede_inventario_routes_1.default);
        this.app.use('/tds_schede_materiali', tds_schede_materiale_routes_1.default);
        this.app.use('/tds_schede_misure', tds_schede_misura_routes_1.default);
        this.app.use('/tds_schede_gruppo_misure', tds_schede_gruppo_misure_routes_1.default);
        this.app.use('/tds_schede_mostre', tds_schede_mostra_routes_1.default);
        this.app.use('/tds_schede_cronologie', tds_schede_cronologia_routes_1.default);
        this.app.use('/tds_schede_provenienze', tds_schede_provenienza_routes_1.default);
        this.app.use('/tds_schede_tecniche', tds_schede_tecnica_routes_1.default);
        this.app.use('/tds_schede_ubicazioni', tds_schede_ubicazione_routes_1.default);
        this.app.use('/tds_users_schede', tds_users_scheda_routes_1.default);
        this.app.use('/tecniche', tecnica_routes_1.default);
        this.app.use('/ubicazioni', ubicazione_routes_1.default);
        this.app.use('/immagini', immagine_routes_1.default);
        this.app.use('/tds_schede_autori', tds_schede_autore_routes_1.default);
        this.app.use('/tds_schede_immagini', tds_schede_immagine_routes_1.default);
        this.app.use('/search', search_routes_1.default);
        // Blocco la route autori disponibile solamente per gli autenticati
        this.app.use('/autori', (0, express_identification_middleware_1.default)(authOptions));
        // Aggiungi la route '/autori' dopo aver applicato il middleware di autenticazione
        this.app.use('/autori', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Verifica se l'utente autenticato è anche un amministratore
            const cookies = new cookies_1.default(req, res);
            let jwt = cookies.get("jwt");
            if (!jwt) {
                return res.status(403).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
            }
            if (yield isAdmin(jwt)) {
                // L'utente è un amministratore, consenti l'accesso alla route '/autori'
                (0, autore_routes_1.default)(req, res, next);
            }
            else {
                // L'utente non è un amministratore, restituisci un errore 403
                return res.status(403).send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'User is not an admin. Access forbidden'));
            }
        }));
        this.app.get('/', (_, res) => res.status(code_enum_1.Code.OK).send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Welcome to the Lumina API v1.0.0')));
        this.app.all('*', (_, res) => res.status(code_enum_1.Code.NOT_FOUND).send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, this.ROUTE_NOT_FOUND)));
    }
}
exports.App = App;
