const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');
const fs = require("fs");
const sqlCreateTableRequest = "./model/create-database-table/create-tables-sql.sql";

async function createTables() {
    const requestTableListSql = fs.readFileSync(sqlCreateTableRequest, "utf8");
    await sqlRequest(requestTableListSql);
}

function sqlRequest(sql) {
    db.exec(sql, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

module.exports = {
    createTables: createTables
}