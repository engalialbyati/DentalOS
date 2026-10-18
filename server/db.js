const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// SQLite is a single local file — no server needed.
const DB_PATH = process.env.SQLITE_PATH || path.resolve(__dirname, 'data.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Convert Postgres-style positional params ($1, $2, ...) to SQLite (?).
function convertParams(sql) {
    return sql.replace(/\$\d+/g, '?');
}

// Execute a query, returning a { rows } shape to match the original pg wrapper.
function exec(text, params = []) {
    const sql = convertParams(text);
    const stmt = sqlite.prepare(sql);
    const upper = text.trim().toUpperCase();
    const hasReturning = /\bRETURNING\b/i.test(text);

    if (upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA') || hasReturning) {
        return { rows: stmt.all(...params) };
    }
    stmt.run(...params);
    return { rows: [], rowCount: sqlite.changes };
}

// Shared "client" used by transaction code (BEGIN/COMMIT/ROLLBACK are plain statements).
// SQLite is synchronous, so transactions in one request handler stay atomic.
const sharedClient = {
    query: (text, params) => exec(text, params),
    release: () => {},
};

module.exports = {
    query: (text, params) => exec(text, params),
    pool: {
        connect: () => Promise.resolve(sharedClient),
        on: () => {},
    },
    // raw handle for schema setup / pragmas
    _db: sqlite,
};
