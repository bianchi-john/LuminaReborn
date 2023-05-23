export const QUERY = {
    SELECT_USERS: 'SELECT * FROM users',
    SELECT_USER: 'SELECT * FROM users WHERE id = ?',
    CREATE_USER: 'INSERT INTO users (id, user_role, email, first_name, last_name, password) VALUES (?, ?, ?, ?, ?, ?);',
    UPDATE_USER: 'UPDATE users SET id = ?, user_role = ?, email = ?, first_name = ?, last_name = ?, password = ? WHERE id = ?',
    DELETE_USER: 'DELETE FROM users WHERE id = ?'
};
