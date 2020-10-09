const commonUtils = require("../common-utilities");

async function saveProperties(source, token) {
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSION  WHERE ID='${token}'`;
        try {
            let userId = await commonUtils.execAsync(userIdSql);
            if (!userId || userId.length === 0) {
                reject("Session is out. Log in again.");
            }
            let userSessionId = userId[0]["USER_ID"];
            let downloadsTime = source["downloadsTime"];
            await commonUtils.execAsync(`UPDATE USERS SET TIME = '${downloadsTime}' WHERE ID = ${userSessionId}`);
            delete source["downloadsTime"];
            let mappingObj = {"yandexFlag": 1, "gismeteoFlag": 2, "weatherFlag": 3, "downloadsTime": false};
            let map = new Map(Object.entries(source));
            await commonUtils.execAsync(`DELETE FROM USER_SOURCES WHERE USER_ID=${userSessionId}`);
            for (let [key, value] of map) {
                if (value) {
                    await commonUtils.execAsync(`INSERT INTO USER_SOURCES (USER_ID,SOURCE_ID) VALUES ('${userSessionId}', '${mappingObj[key]}')`);
                }
            }
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    saveProperties: saveProperties
}
