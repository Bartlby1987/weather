const commonUtils = require("../common-utilities");
const {getForecastWeatherData} = require("../forecast-weather-provider/forecast-weather-provider");
const {getCurrentWeather} = require("../current-weather-provider/current-weather-provider");

async function loadUserInfo(token) {
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSIONS  WHERE ID='${token}'`;
        try {
            let userId = await commonUtils.execAsync(userIdSql);
            if (!userId || userId.length === 0) {
                reject("Session is out. Log in again.");
            }
            userId = userId[0]["USER_ID"];
            let sourcesSql = `SELECT s.NAME FROM USER_SOURCES us JOIN SOURCES s on us.SOURCE_ID= s.ID WHERE us.USER_ID=${userId}`
            let sources = (await commonUtils.execAsync(sourcesSql)).map((el) => el["NAME"]);
            let sourcesObj = {};
            for (let i = 0; i < sources.length; i++) {
                sourcesObj[sources[i]] = true;
            }
            let citesSql = `SELECT CITY,SHOW_FORECAST FROM USERS_CITIES WHERE USER_ID='${userId}'`
            let cites = await commonUtils.execAsync(citesSql);
            let weatherData = [];
            let currentWeather;
            for (let i = 0; i < cites.length; i++) {
                let city = cites[i]["CITY"];

                let showForecast = JSON.parse(cites[i]["SHOW_FORECAST"]);
                currentWeather = (await getCurrentWeather(token, [city]))[0];
                if (showForecast) {
                    let cityAndSours = {
                        "citiesSource": sourcesObj,
                        "city": city
                    }
                    currentWeather["threeDayData"] = getForecastWeatherData(cityAndSours);
                }
                weatherData.push(currentWeather);
            }

            resolve(weatherData)
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    loadUserInfo: loadUserInfo
}
