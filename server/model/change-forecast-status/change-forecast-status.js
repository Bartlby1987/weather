const commonUtils = require("../common-utilities");

async function changeForecastStatus(city, userSessionId) {
    return new Promise(async (resolve, reject) => {
        try {
            city = city["city"];
            let forecastStatus = await commonUtils.execAsync(`SELECT SHOW_FORECAST FROM USERS_CITIES  WHERE USER_ID='${userSessionId}' AND CITY='${city}'`);
            let forecast = !JSON.parse(forecastStatus[0]["SHOW_FORECAST"]);
            await commonUtils.execAsync(`UPDATE USERS_CITIES SET SHOW_FORECAST = '${forecast}' WHERE ` +
                `USER_ID = ${userSessionId} AND CITY='${city}'`);
            resolve(true)
        } catch (error) {
            console.error(error);
            reject("Technical issue");
        }
    })
}

module.exports = {
    changeForecastStatus: changeForecastStatus
}
