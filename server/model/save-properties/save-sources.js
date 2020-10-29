const commonUtils = require("../common-utilities");

async function saveProperties(source, userSessionId) {
    return new Promise(async (resolve, reject) => {
        try {
            let downloadsTime = source["downloadsTime"];
            await commonUtils.execAsync(`UPDATE USERS SET SHOW_TIME = '${downloadsTime}' WHERE ID = ${userSessionId}`);
            delete source["downloadsTime"];
            let mappingObj = {"yandexFlag": 1, "gismeteoFlag": 2, "weatherFlag": 3};
            let map = new Map(Object.entries(source));
            await commonUtils.execAsync(`DELETE FROM USER_SOURCES WHERE USER_ID=${userSessionId}`);
            for (let [key, value] of map) {
                if (value) {
                    await commonUtils.execAsync(`INSERT INTO USER_SOURCES (USER_ID,SOURCE_ID) VALUES ('${userSessionId}', '${mappingObj[key]}')`);
                }
            }
            resolve(true);
        } catch (error) {
            console.error(error);
            reject("Technical issue");
        }
    })
}

module.exports = {
    saveProperties: saveProperties
}
