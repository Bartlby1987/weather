const crypto = require('crypto');
const TokenGenerator = require('uuid-token-generator');
const tokenObj = new TokenGenerator(256, TokenGenerator.BASE62);
const statusResponse = {
    personNotExisted: "Wrong password or login.",
    internalError: "Internal Server Error."
}
const commonUtils = require("../common-utilities");

async function authorizeUser(loginPassword) {
    return new Promise(async (resolve, reject) => {
            try {
                let login = loginPassword["login"];
                let sessionExistSql = `SELECT login FROM usersSession WHERE login='${login}'`;
                let existSession = await commonUtils.execAsync(sessionExistSql);
                if (existSession || existSession.length !== 0) {
                    let sqlDeleteSession = `DELETE FROM  usersSession   WHERE login='${login}'`;
                    await commonUtils.execAsync(sqlDeleteSession);
                }
                let hashPassword = crypto.createHash('md5').update(loginPassword["password"]).digest('hex');
                let sqlExistedUser = `SELECT * FROM users WHERE login='${loginPassword["login"]}' AND ` +
                    `password='${hashPassword}'`;
                let existedUser = await commonUtils.execAsync(sqlExistedUser);
                if (!existedUser || existedUser.length === 0) {
                    reject(statusResponse.personNotExisted)
                } else {
                    let i = 0;
                    let token;
                    while (true) {
                        i++;
                        token = tokenObj.generate();
                        let sqlExistedSessionWithToken = `SELECT sessionId FROM usersSession WHERE sessionId='${token}'`;
                        let sessionId = await commonUtils.execAsync(sqlExistedSessionWithToken);
                        if (!sessionId || sessionId.length === 0) {
                            break;
                        }
                    }

                    let userInfo = existedUser[0];
                    let params = [token, userInfo["name"], userInfo["email"],
                        userInfo["login"]]
                    await commonUtils.execAsync("INSERT INTO usersSession (sessionId,name,email,login) " +
                        " VALUES (?,?,?,?)", params);
                    resolve({
                        sessionId: token,
                        name: userInfo["name"],
                        email: userInfo["email"],
                        login: userInfo["login"]
                    })
                }
            } catch (error) {
                reject(statusResponse.internalError);
            }
        }
    )
}

async function logOutFromSession(token) {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlDeleteSession = `DELETE FROM  usersSession   WHERE sessionId='${token}'`;
            await commonUtils.execAsync(sqlDeleteSession);
        } catch (err) {
            reject(statusResponse.internalError);
        }
    })
}

async function checkSession(token) {
    return new Promise(async (resolve, reject) => {
        try {

            let sqlPersonInfo = `SELECT * FROM usersSession WHERE sessionId='${token}'`;
            let sessionId = await commonUtils.execAsync(sqlPersonInfo);
            resolve(sessionId[0]);

        } catch (err) {
            reject(statusResponse.internalError);
        }
    });
}


module.exports = {
    authorizeUser: authorizeUser,
    checkSession: checkSession,
    logOutFromSession: logOutFromSession
}