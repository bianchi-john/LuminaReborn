export const QUERY = {
    GENERIC_SEARCH: "SELECT * FROM schede WHERE LOWER(titolo_di_servizio) LIKE ? OR LOWER(titolo_opera) LIKE ?;"
};
