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
exports.handleLoginPost = exports.handleLoginPage = void 0;
const axios_1 = __importDefault(require("axios"));
function handleLoginPage(req, res) {
    res.render('login', { cssFilePath: '/styles/login.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/login.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
}
exports.handleLoginPage = handleLoginPage;
function handleLoginPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
                // Save JWT token in a cookie
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
    });
}
exports.handleLoginPost = handleLoginPost;
