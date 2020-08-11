const _ = require('lodash');
const commonUtilities = require("../common-utilities");
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
                commonUtilities.logDataLoadingError(key.slice(0, -4), e);
            }
        }
    }
    if (requestedSourcesForecast.length === 0) {
        return []
    }
    let requestedSourcesForecastForDays = _.zip(...requestedSourcesForecast);
    let first = forecastWeatherUtils.calculateAverageWeatherData(requestedSourcesForecastForDays[0], date[0]);
    let second = forecastWeatherUtils.calculateAverageWeatherData(requestedSourcesForecastForDays[1], date[1]);
    let third = forecastWeatherUtils.calculateAverageWeatherData(requestedSourcesForecastForDays[2], date[2]);
    return [first, second, third]
}

module.exports = {
    getForecastWeatherData: getForecastWeatherData
};
