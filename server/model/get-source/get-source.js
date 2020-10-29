const commonUtils = require("../common-utilities");
async function getSource(userSessionId) {
    return new Promise(async (resolve, reject) => {
        try {
            let sourcesSql = `SELECT s.NAME FROM USER_SOURCES us JOIN SOURCES s on us.SOURCE_ID= s.ID WHERE us.USER_ID=${userSessionId}`
            let sources = (await commonUtils.execAsync(sourcesSql)).map((el) => el["NAME"]);
            let source = commonUtils.changeSourceStructure(sources);
            let showTime = await commonUtils.execAsync(`SELECT SHOW_TIME FROM USERS WHERE ID='${userSessionId}'`)
            source['downloadsTime'] = JSON.parse(showTime[0]["SHOW_TIME"]);
            resolve(source)
        } catch (error) {
            console.error(error);
            reject("Technical issue");
        }
    })
}

module.exports = {
    getSource: getSource
}