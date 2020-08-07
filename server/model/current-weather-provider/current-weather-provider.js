const weathercomProvider = require('./current-weathercom-weather-provider/current-weathercom-weather-provider.js');
const yandexProvider = require('./current-yandex-weather-provider/current-yandex-weather-provider.js');
const gismeteoProvider = require('./current-gismeteo-weather-provider/current-gismeteo-weather-provider.js');
const cityNameResolve = require("./full-city-name-resolve");
const commonUtilities = require("../common-utilities");
const constants = require('../constant-list');

const mappingProvider = {
    "yandex": yandexProvider,
    "gismeteo": gismeteoProvider,
    "weatherCom": weathercomProvider

}

function createCityWeatherData(addCity, sources) {
    let cityData = {
        "city": addCity
    };
    for (let i = 0; i < sources.length; i++) {
        let source = sources[i];
        let provider = mappingProvider[source];
        try {
            cityData[source] = provider.getWeather(addCity)
        } catch (e) {
            commonUtilities.logDataLoadingError(source, e);
            cityData[source] = {temp: constants.NO_DATA, humidity: constants.NO_DATA}
        }
    }
    cityData["loadCityTime"] = getLoadDataTime();
    cityData["threeDayWeatherStatus"] =false;
    return cityData
}

function getLoadDataTime() {
    let hours = new Date().getHours();
    let minutes = new Date().getMinutes();
    if (JSON.stringify(minutes).length === 1) {
        minutes = "0" + minutes;
    }
    return (hours + ":" + minutes).trim();
}

function deleteRepeatCities(cities) {
    let newCitiesArray = cities.map((str) => {
        return cityNameResolve.getFullCityNameResolve(str);
    });
    return Array.from(new Set(newCitiesArray));
}

function getCurrentWeather(citiesAndSource) {
    let newCitiesData = [];
    let sources = citiesAndSource.source;
    let citiesArray = deleteRepeatCities(citiesAndSource.cities);
    citiesArray = [...new Set(citiesArray)];
    if (citiesArray.length !== 0) {
        for (let i = 0; i < citiesArray.length; i++) {
            let city = citiesArray[i];
            if (city !== "") {
                newCitiesData.push(createCityWeatherData(city, sources));
            }
        }
        return newCitiesData
    }
}

module.exports = {
    getCurrentWeather: getCurrentWeather
};