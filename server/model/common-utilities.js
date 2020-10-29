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
                console.error(error);
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

async function getUserId(token) {
    let userIdSql = `SELECT USER_ID FROM USERS_SESSIONS  WHERE ID='${token}'`;
    let userId = await execAsync(userIdSql);
    if (userId || userId.length !== 0) {
        return userId[0]["USER_ID"];
    }
}

function changeSourceStructure(source) {
    let mySet = new Set(source);
    let mapping = {
        yandexFlag: "yandex",
        gismeteoFlag: "gismeteo",
        weatherFlag: "weatherCom",
    };
    for (let key in mapping) {
        mapping[key] = mySet.has(mapping[key])
    }
    return mapping
}

module.exports = {
    logDataLoadingError: logDataLoadingError,
    execAsync: execAsync,
    changeSourceStructure: changeSourceStructure,
    getUserId: getUserId
};

