"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    ADVANCED_SEARCH: "SELECT * FROM schede WHERE LOWER(titolo_di_servizio) LIKE ? OR LOWER(titolo_opera) LIKE ?;",
};
