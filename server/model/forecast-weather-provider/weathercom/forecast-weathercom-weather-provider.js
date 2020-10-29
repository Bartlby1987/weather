const request = require('sync-request');
const cheerio = require('cheerio');
const fs = require("fs");
const {getTransformHumidity} = require("../forecast-weather-utilities");
let path = __dirname + "/weathercom-forecast-cache.json";
const API_REQUEST = (value) => `https://api.openweathermap.org/data/2.5/weather?q=${value}` +
    `,&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e`
const API_REQUEST_FOR_COORDINATES = (lat, lon) => `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}` +
    `&units=metric&exclude=hourly,current,minutely&appid=0b58b5094eddd4fdfa4a1fe10ca5034e`
const CACHE_LIFETIME_LIMIT_IN_MILLISECONDS = 60 * 60 * 1000;
const FIRST_DAY_VALUE = 1;
const SECOND_DAY_VALUE = 2;
const THIRD_DAY_VALUE = 3;
const mappingProvider = [{"dayIndex": FIRST_DAY_VALUE}, {"dayIndex": SECOND_DAY_VALUE}, {"dayIndex": THIRD_DAY_VALUE}];

function getForecastWeather(city) {
    let oldData;
    let oldCityData;
    let loadTime = new Date().getTime();
    let oldDataStr;
    try {
        oldDataStr = fs.readFileSync(path, 'utf8');
    } catch {
        oldDataStr = "";
    }
    if (oldDataStr !== "") {
        oldData = JSON.parse(oldDataStr);
        oldCityData = oldData[city];
    }
    if ((oldData) && (oldData[city]) && (loadTime - oldCityData.loadTime) < CACHE_LIFETIME_LIMIT_IN_MILLISECONDS) {
        return oldCityData.forecast
    }
    let url = encodeURI(API_REQUEST(city));
    let res = request('GET', url, {});
    let jsonDataAPIForCoordinates = (cheerio.load(res.getBody()));
    let jsonData = jsonDataAPIForCoordinates.text();
    let jsonObj = JSON.parse(jsonData);
    let lon = jsonObj["coord"]["lon"];
    let lat = jsonObj["coord"]["lat"];
    let apiRequest = encodeURI(API_REQUEST_FOR_COORDINATES(lat, lon));
    let rest = request('GET', apiRequest, {});
    let jsonDataAPIForWeather = (cheerio.load(rest.getBody()));
    let jsonDataResponse = jsonDataAPIForWeather.text();
    let jsonObjResponse = JSON.parse(jsonDataResponse);

    function getTempDay(dayValue) {
        return Math.round(Number(jsonObjResponse["daily"][dayValue]["temp"]["day"]));
    }

    function getTempNight(dayValue) {
        return Math.round(Number(jsonObjResponse["daily"][dayValue]["temp"]["night"]));
    }

    function getHumidityDay(dayValue) {
        return jsonObjResponse["daily"][dayValue]["weather"][0]["main"];
    }

    let weatherComData = {};
    let forecast = mappingProvider.map((element) => {
        return {
            "tempDay": getTempDay(element.dayIndex),
            "tempNight": getTempNight(element.dayIndex),
            "humidity": getTransformHumidity(getHumidityDay(element.dayIndex)),
            "humidityDay": "",
            "humidityNight": ""
        }
    })
    weatherComData[city] = {
        loadTime: loadTime,
        forecast: forecast
    };
    if ((typeof oldData) !== "object") {
        fs.writeFileSync(path, JSON.stringify(weatherComData));
        return weatherComData[city]["forecast"]
    }
    oldData[city] = weatherComData[city];
    fs.writeFileSync(path, JSON.stringify(oldData));
    return weatherComData[city]["forecast"];
}

module.exports = {
    getForecastWeather: getForecastWeather
};
