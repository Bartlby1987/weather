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

function getForecastWeatherData(cityAndSource) {
    let city = cityAndSource.city;
    let requestedSourcesForecast = [];
    let source = cityAndSource.citiesSource;
    let date = forecastWeatherUtils.getForecastDate();
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
    getForecastWeatherData: getForecastWeatherData
};
