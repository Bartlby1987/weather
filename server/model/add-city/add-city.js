const commonUtils = require("../common-utilities");
const cityName = require("../current-weather-provider/full-city-name-resolve.js");

async function addCity(city, userSessionId) {
    let userCity = cityName.getFullCityNameResolve(city["city"]);
    return new Promise(async (resolve, reject) => {
        try {
            let cityExistsSql = `SELECT CITY FROM USERS_CITIES  WHERE CITY='${userCity}' AND USER_ID='${userSessionId}'`;
            let cityExists = await commonUtils.execAsync(cityExistsSql);
            if (!cityExists || cityExists.length === 0) {
                await commonUtils.execAsync(`INSERT INTO USERS_CITIES VALUES (?,?,?)`, [userSessionId, userCity, "false"]);
                resolve(true);
            } else {
                reject("This city already exists")
            }
        } catch (error) {
            console.error(error);
            reject("Technical issue");
        }
    })
}

module.exports = {
    addCity: addCity
}
