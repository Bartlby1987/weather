const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');
const statusResponse = {
    successful: "Registration was successful",
    loginUsed: "This login or email already in use by another person."
}
let hashPassword = (password) => {
    return crypto.createHash('md5').update(password).digest('hex');
}
let createTableSql = "CREATE TABLE IF NOT EXISTS users (name TEXT NOT NULL,email TEXT NOT NULL UNIQUE," +
    "login TEXT NOT NULL UNIQUE ,password TEXT NOT NULL)";

async function addUserRegistrationInformation(registrationData) {
    return new Promise(async (resolve, reject) => {
        await execAsync(createTableSql)

        let sql = `SELECT login, email FROM users WHERE login='${registrationData["login"]}' OR ` +
            `email='${registrationData["email"]}'`;
        try {
            let existedUser = await execAsync(sql);
            if (!existedUser || existedUser.length === 0) {
                let params = [registrationData["name"], registrationData["email"],
                    registrationData["login"], hashPassword(registrationData["password"])];
                await execAsync("INSERT INTO users VALUES (?,?,?,?)", params);
                resolve(statusResponse.successful)
            } else {
                reject(statusResponse.loginUsed)
            }

        } catch (error) {
            reject("technical issue");
        }
    })
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
    addUserRegistrationInformation: addUserRegistrationInformation
}
