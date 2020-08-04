const fs = require("fs");
let path = require("path");

let forecastCacheFilePath = path.resolve("./cache/forecast-cache.json");
let currentWeatherCacheFilePath = path.resolve("./model/current-weather-provider/current-weathercom-weather-provider/weathercom-current-cache.json");
let forecastWeatherCacheFilePath = path.resolve("./model/forecast-weather-provider/weathercom-forecast-cache.json");

let data = "";

function clearAllCacheFile() {
    fs.writeFileSync(forecastCacheFilePath, data);
    fs.writeFileSync(forecastWeatherCacheFilePath, data);
    fs.writeFileSync(currentWeatherCacheFilePath, data);
}

module.exports = {
    clearAllCacheFile: clearAllCacheFile
};