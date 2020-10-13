const crypto = require('crypto');
const TokenGenerator = require('uuid-token-generator');
const tokenObj = new TokenGenerator(256, TokenGenerator.BASE62);
const statusResponse = {
    personNotExisted: "Wrong password or login.",
    internalError: "Internal Server Error."
}
const commonUtils = require("../common-utilities");
async function authorizeUser(loginPassword, sessionId) {
    return new Promise(async (resolve, reject) => {
            if (sessionId) {
                let sqlDeleteSession = `DELETE FROM  USERS_SESSIONS  WHERE ID='${sessionId}'`;
                await commonUtils.execAsync(sqlDeleteSession);
            }
            try {
                let hashPassword = crypto.createHash('md5').update(loginPassword["password"]).digest('hex');
                let sqlExistedUser = `SELECT * FROM USERS WHERE LOGIN='${loginPassword["login"]}' AND ` +
                    `PASSWORD_HASH='${hashPassword}'`;
                let existedUser = await commonUtils.execAsync(sqlExistedUser);
                if (!existedUser || existedUser.length === 0) {
                    reject(statusResponse.personNotExisted)
                } else {
                    let i = 0;
                    let token;
                    while (true) {
                        i++;
                        token = tokenObj.generate();
                        let sqlExistedSessionWithToken = `SELECT ID FROM USERS_SESSIONS WHERE ID='${token}'`;
                        let ID = await commonUtils.execAsync(sqlExistedSessionWithToken);
                        if (!ID || ID.length === 0) {
                            break;
                        }
                    }
                    let userInfo = existedUser[0];
                    let userId = userInfo["ID"]
                    let params = [token, userId]
                    await commonUtils.execAsync("INSERT INTO USERS_SESSIONS (ID,USER_ID) " +
                        " VALUES (?,?)", params);
                    resolve({
                        id: token,
                        userId: userId
                    })
                }
            } catch (error) {
                console.error(error)
                reject(statusResponse.internalError);
            }
        }
    )
}

async function logOutFromSession(token) {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlDeleteSession = `DELETE FROM  USERS_SESSIONS   WHERE ID='${token}'`;
            await commonUtils.execAsync(sqlDeleteSession);
        } catch (err) {
            reject(statusResponse.internalError);
        }
    })
}

async function checkSession(token) {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlPersonInfo = `SELECT * FROM USERS_SESSIONS WHERE ID='${token}'`;
            let ID = await commonUtils.execAsync(sqlPersonInfo);
            resolve(ID[0]);
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