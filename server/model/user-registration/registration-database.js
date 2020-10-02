const crypto = require('crypto');
const commonUtils = require("../common-utilities");
const statusResponse = {
    successful: "Registration was successful",
    loginUsed: "This login or email already in use by another person."
}
let hashPassword = (password) => {
    return crypto.createHash('md5').update(password).digest('hex');
}

async function addUserRegistrationInformation(registrationData) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT LOGIN, EMAIL FROM users WHERE LOGIN='${registrationData["login"]}' OR ` +
            `EMAIL='${registrationData["email"]}'`;
        try {
            let existedUser = await commonUtils.execAsync(sql);
            if (!existedUser || existedUser.length === 0) {
                let params = [null, registrationData["name"], registrationData["email"],
                    registrationData["login"], hashPassword(registrationData["password"])];
                await commonUtils.execAsync("INSERT INTO users VALUES (?,?,?,?,?)", params);
                resolve(statusResponse.successful)
            } else {
                reject(statusResponse.loginUsed)
            }

        } catch (error) {
            reject("technical issue");
        }
    })
}

module.exports = {
    addUserRegistrationInformation: addUserRegistrationInformation
}
