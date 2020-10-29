const commonUtils = require("../common-utilities");
const {getForecastData} = require("../forecast-weather-provider/forecast-weather-provider");
const {getCurrentWeather} = require("../current-weather-provider/current-weather-provider");

async function loadUserInfo(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            let citesSql = `SELECT CITY,SHOW_FORECAST FROM USERS_CITIES WHERE USER_ID='${userId}'`
            let cites = await commonUtils.execAsync(citesSql);
            let weatherData = [];
            let currentWeather;
            for (let i = 0; i < cites.length; i++) {
                let city = cites[i]["CITY"];
                let showForecast = JSON.parse(cites[i]["SHOW_FORECAST"]);
                currentWeather = (await getCurrentWeather(userId, [city]))[0];
                if (showForecast) {
                    currentWeather["threeDayData"] = await getForecastData(city, userId);
                    currentWeather["threeDayWeatherStatus"] = showForecast;
                }
                weatherData.push(currentWeather);
            }
            resolve(weatherData)
        } catch (error) {
            console.error(error);
            reject("Technical issue");
        }
    })
}

module.exports = {
    loadUserInfo: loadUserInfo
}
