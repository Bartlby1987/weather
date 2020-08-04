const fs = require("fs");
let forecastWeatherProvider = require('../model/forecast-weather-provider/forecast-weather-provider');
let path = require("path");
let cacheFilePath = path.resolve("./cache/forecast-cache.json");
 function getForecast(requestData) {
    let cacheFileString = fs.readFileSync(cacheFilePath, "utf8");
    // console.log("\n Данные полученные из кэша :\n\n" + cacheFileString+"\n\n");
    let weatherData = [];
    let forecastData = {};
    if (cacheFileString === "") {
        forecastData["city"] = requestData["city"];
        forecastData["sources"] = requestData["citiesSource"];
        forecastData["requestTime"] = new Date().getTime();
        let forecastWeather=forecastWeatherProvider.getForecastWeatherData(requestData);
        forecastData["forecastWeather"] = forecastWeather;
        weatherData.push(forecastData);
        // console.log("Запивываем данные в случае отсутствия данных в кэше  :\n\n" + JSON.stringify(weatherData)+"\n\n");
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
        const oneHourInMilliseconds = 3600000;
        let isRequestTimeMoreThanOneOur = (nowRequestTime - weatherWriteTimeRequest) < oneHourInMilliseconds;
        if (isNewAndOldCitiesAreEqual && isNewAndOldYandexSourceAreEqual && isNewAndOldGismeteoSourceAreEqual && isNewAndOldWeatherSourceAreEqual &&
            isRequestTimeMoreThanOneOur) {
            // console.log("Данные которые беруться из кеша в случае совпадения города и источников :\n\n"+
            //     JSON.stringify(oldWeatherData[i])+"\n\n");
            return oldOneCityForecast;
        }
        if (isNewAndOldCitiesAreEqual) {
            let threeDaysWeatherData =  forecastWeatherProvider.getForecastWeatherData(requestData);
            // console.log("\n\nДанные полученные за 3 дня :\n\n"+JSON.stringify(threeDaysWeatherData));
            weatherWriteTimeRequest = new Date().getTime();
            oldOneCityForecast = threeDaysWeatherData;
            oneCityOldData["sources"] = requestData["citiesSource"];
            // console.log("Записываем данные в кэшь если город собподает, но источники нет :\n\n" + JSON.stringify(oldWeatherData)+"\n\n");
            fs.writeFileSync(cacheFilePath, JSON.stringify(oldWeatherData));
            return threeDaysWeatherData
        }
    }

    let forecast =  forecastWeatherProvider.getForecastWeatherData(requestData);
    let newCityForecast = {
        "city": requestData["city"],
        "sources": requestData["citiesSource"],
        "requestTime": new Date().getTime(),
        "forecast": forecast
    };
    oldWeatherData.push(newCityForecast);
    // console.log("Данные если за три дня по городу данных нет\n\n"+JSON.stringify(oldWeatherData)+"\n\n");
    fs.writeFileSync(cacheFilePath, JSON.stringify(oldWeatherData));
    return forecast
}

  // console.log(getForecast({citiesSource: {yandexFlag: true, gismeteoFlag: true, weatherFlag: true}, city: "Рим"}));
module.exports = {
    getForecast: getForecast
};