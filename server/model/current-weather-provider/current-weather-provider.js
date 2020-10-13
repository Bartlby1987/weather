const weathercomProvider = require('./weathercom/current-weathercom-weather-provider.js');
const yandexProvider = require('./yandex/current-yandex-weather-provider.js');
const gismeteoProvider = require('./gismeteo/current-gismeteo-weather-provider.js');
const cityNameResolve = require("./full-city-name-resolve");
const commonUtils = require("../common-utilities");
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
            commonUtils.logDataLoadingError(source, e);
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

async function getCurrentWeather(token, city = null) {
    let cities;
    let newCitiesData = [];
    let userIdSql = `SELECT USER_ID FROM USERS_SESSIONS  WHERE ID='${token}'`;
    let userId = (await commonUtils.execAsync(userIdSql))[0]["USER_ID"];
    let sourcesSql = `SELECT s.NAME FROM USER_SOURCES us JOIN SOURCES s on us.SOURCE_ID= s.ID WHERE us.USER_ID=${userId}`
    let sources = (await commonUtils.execAsync(sourcesSql)).map((el) => el["NAME"]);
    if (city === null) {
        let citiesSql = `SELECT CITY FROM USERS_CITIES WHERE USER_ID='${userId}'`
        cities = (await commonUtils.execAsync(citiesSql)).map((el) => el["CITY"]);
    } else {
        cities = city;
    }
    let citiesArray = deleteRepeatCities(cities);
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