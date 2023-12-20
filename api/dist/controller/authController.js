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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const isAdmin = (jwt) => __awaiter(void 0, void 0, void 0, function* () {
    // Your existing isAdmin logic
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Add your login logic here
        // You can use your existing isAdmin and axios logic
        // For example, checking credentials
        if (username === 'example' && password === 'password') {
            // Generate and send a JWT token
            const jwtToken = 'your_generated_jwt_token';
            res.status(200).json({ jwt: jwtToken });
        }
        else {
            // Invalid credentials
            res.status(403).json({ error: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
});
exports.login = login;
