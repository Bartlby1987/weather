const commonUtils = require("../common-utilities");

async function changeForecastStatus(city, token) {
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSIONS  WHERE ID='${token}'`;
        try {
            let userId = await commonUtils.execAsync(userIdSql);
            if (!userId || userId.length === 0) {
                reject("Session is out. Log in again.");
            }
            let userSessionId = userId[0]["USER_ID"];
            city = city["city"];
            let forecastStatus = await commonUtils.execAsync(`SELECT SHOW_FORECAST FROM USERS_CITIES  WHERE USER_ID='${userSessionId}' AND CITY='${city}'`);
            let forecast = !JSON.parse(forecastStatus[0]["SHOW_FORECAST"]);
            await commonUtils.execAsync(`UPDATE USERS_CITIES SET SHOW_FORECAST = '${forecast}' WHERE ` +
                `USER_ID = ${userSessionId} AND CITY='${city}'`);
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    changeForecastStatus: changeForecastStatus
}
