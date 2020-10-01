const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

function createTables() {
    let createTableSql = "CREATE TABLE IF NOT EXISTS users (name TEXT NOT NULL,email TEXT NOT NULL UNIQUE," +
        "login TEXT NOT NULL UNIQUE ,password TEXT NOT NULL)";
    sqlRequest(createTableSql)
    let createSessionTableSql = "CREATE TABLE IF NOT EXISTS usersSession (sessionId TEXT NOT NULL ," +
        "name TEXT NOT NULL,email TEXT NOT NULL UNIQUE, login TEXT NOT NULL UNIQUE)";
    sqlRequest(createSessionTableSql)
}

function sqlRequest(sql) {
    db.all(sql, [], (err) => {
        if (err) {
            throw err;
        }
    });
}

module.exports = {
    createTables: createTables
}