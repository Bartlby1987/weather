const commonUtils = require("../common-utilities");
const cityName = require("../current-weather-provider/full-city-name-resolve.js");

async function getSource(token) {
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSIONS  WHERE ID='${token}'`;
        try {
            let userId = await commonUtils.execAsync(userIdSql);
            if (!userId || userId.length === 0) {
                reject("Session is out. Log in again.");
            }
            let userSessionId = userId[0]["USER_ID"];
            let sourcesSql = `SELECT s.NAME FROM USER_SOURCES us JOIN SOURCES s on us.SOURCE_ID= s.ID WHERE us.USER_ID=${userSessionId}`
            let sources = (await commonUtils.execAsync(sourcesSql)).map((el) => el["NAME"]);
            let source = {
                yandexFlag: false,
                gismeteoFlag: false,
                weatherFlag: false,
                downloadsTime: await commonUtils.execAsync(`SELECT SHOW_TIME FROM USERS WHERE ID='${userSessionId}'`)
            };
            for (let i = 0; i < sources.length; i++) {
                if (sources[i] === "yandex") {
                    source.yandexFlag = true;
                } else if (sources[i] === "gismeteo") {
                    source.gismeteoFlag = true
                } else if (sources[i] === "weatherCom") {
                    source.weatherFlag = true;
                }
            }
            resolve(source)
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    getSource: getSource
}
