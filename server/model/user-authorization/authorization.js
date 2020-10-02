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
                let sessionExistSql = `SELECT USER_LOGIN FROM usersSession WHERE USER_LOGIN='${login}'`;
                let existSession = await commonUtils.execAsync(sessionExistSql);
                if (existSession || existSession.length !== 0) {
                    let sqlDeleteSession = `DELETE FROM  usersSession  WHERE USER_LOGIN='${login}'`;
                    await commonUtils.execAsync(sqlDeleteSession);
                }
                let hashPassword = crypto.createHash('md5').update(loginPassword["password"]).digest('hex');
                let sqlExistedUser = `SELECT * FROM users WHERE LOGIN='${loginPassword["login"]}' AND ` +
                    `PASSWORD='${hashPassword}'`;
                let existedUser = await commonUtils.execAsync(sqlExistedUser);
                if (!existedUser || existedUser.length === 0) {
                    reject(statusResponse.personNotExisted)
                } else {
                    let i = 0;
                    let token;
                    while (true) {
                        i++;
                        token = tokenObj.generate();
                        let sqlExistedSessionWithToken = `SELECT ID FROM usersSession WHERE ID='${token}'`;
                        let ID = await commonUtils.execAsync(sqlExistedSessionWithToken);
                        if (!ID || ID.length === 0) {
                            break;
                        }
                    }

                    let userInfo = existedUser[0];
                    let params = [token, userInfo["NAME"], userInfo["EMAIL"],
                        userInfo["LOGIN"]]
                    await commonUtils.execAsync("INSERT INTO usersSession (ID,USER_NAME,USER_EMAIL,USER_LOGIN) " +
                        " VALUES (?,?,?,?)", params);
                    resolve({
                        id: token,
                        name: userInfo["NAME"],
                        email: userInfo["EMAIL"],
                        login: userInfo["LOGIN"]
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
            let sqlDeleteSession = `DELETE FROM  usersSession   WHERE ID='${token}'`;
            await commonUtils.execAsync(sqlDeleteSession);
        } catch (err) {
            reject(statusResponse.internalError);
        }
    })
}

async function checkSession(token) {
    return new Promise(async (resolve, reject) => {
        try {

            let sqlPersonInfo = `SELECT * FROM usersSession WHERE ID='${token}'`;
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