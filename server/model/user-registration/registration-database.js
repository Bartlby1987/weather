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
        let sql = `SELECT LOGIN, EMAIL FROM USERS WHERE LOGIN='${registrationData["login"]}' OR ` +
            `EMAIL='${registrationData["email"]}'`;
        try {
            let existedUser = await commonUtils.execAsync(sql);
            if (!existedUser || existedUser.length === 0) {
                let params = [null, registrationData["name"], registrationData["email"],
                    registrationData["login"], hashPassword(registrationData["password"]), "true"];
                await commonUtils.execAsync("INSERT INTO USERS VALUES (?,?,?,?,?,?)", params);
                let userIdObj = await commonUtils.execAsync(`SELECT ID FROM USERS WHERE LOGIN='${registrationData["login"]}' OR ` +
                    `EMAIL='${registrationData["email"]}'`);
                let userId = userIdObj[0]["ID"];
                await commonUtils.execAsync(`INSERT INTO USER_SOURCES (USER_ID,SOURCE_ID) VALUES (${userId},1)`);
                await commonUtils.execAsync(`INSERT INTO USER_SOURCES (USER_ID,SOURCE_ID) VALUES (${userId},2)`);
                await commonUtils.execAsync(`INSERT INTO USER_SOURCES (USER_ID,SOURCE_ID) VALUES (${userId},3)`);
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
