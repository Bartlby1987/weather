const commonUtils = require("../common-utilities");
const {getForecastData} = require("../forecast-weather-provider/forecast-weather-provider");
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
            let citesSql = `SELECT CITY,SHOW_FORECAST FROM USERS_CITIES WHERE USER_ID='${userId}'`
            let cites = await commonUtils.execAsync(citesSql);
            let weatherData = [];
            let currentWeather;
            for (let i = 0; i < cites.length; i++) {
                let city = cites[i]["CITY"];
                let showForecast = JSON.parse(cites[i]["SHOW_FORECAST"]);
                currentWeather = (await getCurrentWeather(token, [city]))[0];
                if (showForecast) {

                    currentWeather["threeDayData"] = await getForecastData(city, token);
                    currentWeather["threeDayWeatherStatus"] = showForecast;
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
