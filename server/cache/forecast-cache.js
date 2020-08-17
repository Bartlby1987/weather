const fs = require("fs");
let forecastWeatherProvider = require('../model/forecast-weather-provider/forecast-weather-provider');
let path = require("path");
let cacheFilePath = path.resolve("./cache/forecast-cache.json");
const CACHE_LIFETIME_LIMIT_IN_MILLISECONDS = 60 * 60 * 1000;

function getForecast(requestData) {
    let cacheFileString = fs.readFileSync(cacheFilePath, "utf8");
    let weatherData = [];
    let forecastData = {};
    if (cacheFileString === "") {
        forecastData["city"] = requestData["city"];
        forecastData["sources"] = requestData["citiesSource"];
        forecastData["requestTime"] = new Date().getTime();
        let forecastWeather = forecastWeatherProvider.getForecastWeatherData(requestData);
        forecastData["forecastWeather"] = forecastWeather;
        weatherData.push(forecastData);
        fs.writeFileSync(cacheFilePath, JSON.stringify(weatherData));
        return forecastWeather;
    }
    let oldWeatherData = (JSON.parse(cacheFileString));
    let nowRequestTime = new Date().getTime();
    for (let i = 0; i < oldWeatherData.length; i++) {
        let oneCityOldData = oldWeatherData[i];
        let weatherWriteTimeRequest = oneCityOldData["requestTime"];
        let isNewAndOldCitiesAreEqual = oneCityOldData["city"] === requestData["city"];
        let oldOneCityForecast = oneCityOldData["forecast"];
        let isNewAndOldYandexSourceAreEqual = oneCityOldData["yandexFlag"] === requestData["citiesSource"]["yandexFlag"];
        let isNewAndOldGismeteoSourceAreEqual = oneCityOldData["gismeteoFlag"] === requestData["citiesSource"]["gismeteoFlag"];
        let isNewAndOldWeatherSourceAreEqual = oneCityOldData["weatherFlag"] === requestData["citiesSource"]["weatherFlag"];
        let isRequestTimeMoreThanOneOur = (nowRequestTime - weatherWriteTimeRequest) < CACHE_LIFETIME_LIMIT_IN_MILLISECONDS;
        if (isNewAndOldCitiesAreEqual && isNewAndOldYandexSourceAreEqual && isNewAndOldGismeteoSourceAreEqual && isNewAndOldWeatherSourceAreEqual &&
            isRequestTimeMoreThanOneOur) {
            return oldOneCityForecast;
        }
        if (isNewAndOldCitiesAreEqual) {
            let threeDaysWeatherData = forecastWeatherProvider.getForecastWeatherData(requestData);
            oneCityOldData["requestTime"] = new Date().getTime();
            oneCityOldData["forecast"] = threeDaysWeatherData;
            oneCityOldData["sources"] = requestData["citiesSource"];
            fs.writeFileSync(cacheFilePath, JSON.stringify(oldWeatherData));
            return threeDaysWeatherData
        }
    }

    let forecast = forecastWeatherProvider.getForecastWeatherData(requestData);
    let newCityForecast = {
        "city": requestData["city"],
        "sources": requestData["citiesSource"],
        "requestTime": new Date().getTime(),
        "forecast": forecast
    };
    oldWeatherData.push(newCityForecast);
    fs.writeFileSync(cacheFilePath, JSON.stringify(oldWeatherData));
    return forecast
}

module.exports = {
    getForecast: getForecast
};