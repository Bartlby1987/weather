const commonUtils = require("../common-utilities");
const cityName = require("../current-weather-provider/full-city-name-resolve.js");

async function addCity(city, token) {
    let userCity = cityName.getFullCityNameResolve(city["city"]);
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSION  WHERE ID='${token}'`;
        try {
            let userId = await commonUtils.execAsync(userIdSql);
            if (!userId || userId.length === 0) {
                reject("Session is out. Log in again.");
            }
            let userSessionId = userId[0]["USER_ID"];
            let cityExistsSql = `SELECT CITIES FROM USERS_CITIES  WHERE CITIES='${userCity}' AND USER_ID='${userSessionId}'`;
            let cityExists = await commonUtils.execAsync(cityExistsSql);
            if (!cityExists || cityExists.length === 0) {
                await commonUtils.execAsync(`INSERT INTO USERS_CITIES VALUES (?,?,?)`, [userSessionId, userCity, "false"]);
                resolve(true);
            } else {
                reject("This city already exists")
            }
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    addCity: addCity
}
