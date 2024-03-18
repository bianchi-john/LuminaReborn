"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValutaBozzaPage = void 0;
function handleValutaBozzaPage(req, res) {
    res.render('valutaBozza', { cssFilePath: '/styles/scheda.css', sidebarStyle: '/styles/sidebar.css', jsFilePath: '/scripts/valutaBozza.js', sidebarScript: '/scripts/sidebar.js', imgFilePath: '/img' });
}
exports.handleValutaBozzaPage = handleValutaBozzaPage;
