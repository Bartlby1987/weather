const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

function logDataLoadingError(source, error) {
    console.error(`Error during getting information from ${source} provider:`, error.stack || error);
}

async function execAsync(sql, params) {
    params = params ? params : [];
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}


module.exports = {
    logDataLoadingError: logDataLoadingError,
    execAsync: execAsync
};

