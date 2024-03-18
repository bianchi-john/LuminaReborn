"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSchedaPage = void 0;
function handleSchedaPage(req, res) {
    res.render('scheda', { cssFilePath: '/styles/scheda.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/scheda.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
}
exports.handleSchedaPage = handleSchedaPage;
