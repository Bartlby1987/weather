const _ = require('lodash');
const commonUtils = require("../common-utilities");
const forecastWeatherUtils = require("./forecast-weather-utilities")
const weathercomForecastProvider = require('./weathercom/forecast-weathercom-weather-provider');
const yandexForecastProvider = require('./yandex/forecast-yandex-weather-provider');
const gismeteoForecastProvider = require('./gismeteo/forecast-gismeteo-weather-provider');
const mappingForecastProvider = {
    "yandexFlag": yandexForecastProvider,
    "gismeteoFlag": gismeteoForecastProvider,
    "weatherFlag": weathercomForecastProvider
}

async function getForecastData(city, token) {
    city = city["city"];
    let userIdSql = `SELECT USER_ID FROM USERS_SESSIONS  WHERE ID='${token}'`;
    try {
        let userId = (await commonUtils.execAsync(userIdSql))[0]["USER_ID"];
        let sourcesSql = `SELECT s.NAME FROM USER_SOURCES us JOIN SOURCES s on us.SOURCE_ID= s.ID WHERE us.USER_ID=${userId}`
        let sources = (await commonUtils.execAsync(sourcesSql)).map((el) => el["NAME"]);
        let sourcesObj = commonUtils.changeSourceStructure(sources);
        let cityAndSours = {
            "citiesSource": sourcesObj,
            "city": city
        }
        return await getForecastWeatherData(cityAndSours);
    } catch (err) {
        console.error(err);
    }
}

function getForecastWeatherData(cityAndSource) {
    let city = cityAndSource.city;
    let requestedSourcesForecast = [];
    let source = cityAndSource.citiesSource;
    let date = forecastWeatherUtils.generateNextDates();
    for (let key in source) {
        if (source[key]) {
            try {
                requestedSourcesForecast.push(mappingForecastProvider[key].getForecastWeather(city));
            } catch (e) {
                commonUtils.logDataLoadingError(key.slice(0, -4), e);
            }
        }
    }
    if (requestedSourcesForecast.length === 0) {
        return []
    }
    let requestedSourcesForecastForDays = _.zip(...requestedSourcesForecast);
    let forecastData = [];
    for (let i = 0; i < 3; i++) {
        forecastData.push(forecastWeatherUtils.calculateAverageWeatherData(requestedSourcesForecastForDays[i], date[i]))
    }
    return forecastData
}

module.exports = {
    // getForecastWeatherData: getForecastWeatherData,
    getForecastData: getForecastData
};
