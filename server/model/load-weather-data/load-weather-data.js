const commonUtils = require("../common-utilities");

async function loadUserInfo(token) {
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSION  WHERE ID='${token}'`;
        try {
            let userId = await commonUtils.execAsync(userIdSql);
            if (!userId || userId.length === 0) {
                reject("Session is out. Log in again.");
            }
            userId = userId[0]["USER_ID"];
            let citesSql = `SELECT CITIES,FORECAST FROM USERS_CITIES WHERE USER_ID='${userId}'`
            let cites = await commonUtils.execAsync(citesSql);
            console.log(cites)
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    loadUserInfo: loadUserInfo
}
