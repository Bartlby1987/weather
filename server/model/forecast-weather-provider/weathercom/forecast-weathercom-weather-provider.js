const request = require('sync-request');
const cheerio = require('cheerio');
const fs = require("fs");
const forecastWeatherUtilities = require("../forecast-weather-utilities");
let path = __dirname + "/weathercom-forecast-cache.json";
const API_REQUEST = "https://api.openweathermap.org/data/2.5/weather?q=";
const ID_KEY = ",&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e";
const API_REQUEST_FOR_COORDINATES = "https://api.openweathermap.org/data/2.5/onecall?lat=";
const ID_KEY_FOR_COORDINATES = "&units=metric&exclude=hourly,current,minutely&appid=0b58b5094eddd4fdfa4a1fe10ca5034e";

function getWeatherComDataWeatherForThreeDay(city) {
    let oldWeatherComData;
    let oldWeatherComCityData;
    let loadTime = new Date().getTime();
    let oldWeatherComDataStr;
    try {
        oldWeatherComDataStr = fs.readFileSync(path, 'utf8');
    } catch {
        oldWeatherComDataStr = "";
    }
    if (oldWeatherComDataStr !== "") {
        oldWeatherComData = JSON.parse(oldWeatherComDataStr);
        oldWeatherComCityData = oldWeatherComData[city];
    }
    if ((oldWeatherComData) && (oldWeatherComData[city]) && (loadTime - oldWeatherComCityData.loadTime) < 3600000) {
        return oldWeatherComCityData.forecast
    }
    let url = encodeURI(API_REQUEST + city + ID_KEY);
    let res = request('GET', url, {});
    let $$ = (cheerio.load(res.getBody()));
    let jsonData = $$.text();
    let jsonObj = JSON.parse(jsonData);
    let lon = jsonObj["coord"]["lon"];
    let lat = jsonObj["coord"]["lat"];
    let apiRequest = encodeURI(`${API_REQUEST_FOR_COORDINATES}${lat}&lon=${lon}${ID_KEY_FOR_COORDINATES}`);
    let rest = request('GET', apiRequest, {});
    let $ = (cheerio.load(rest.getBody()));
    let jsonDataRequest = $.text();
    let jsonObjRequest = JSON.parse(jsonDataRequest);

    function getTempDay(dayValue) {
        return Math.round(Number(jsonObjRequest["daily"][dayValue]["temp"]["day"]));
    }

    function getTempNight(dayValue) {
        return Math.round(Number(jsonObjRequest["daily"][dayValue]["temp"] ["night"]));
    }

    function getHumidityDay(dayValue) {
        return jsonObjRequest["daily"][dayValue]["weather"][0]["main"];
    }

    let weatherComData = {};
    let forecast =
        [{
            tempDay: getTempDay(1),
            tempNight: getTempNight(1),
            humidity: forecastWeatherUtilities.getTransformHumidityForWeatherCom(getHumidityDay(1)),
            humidityDay: "",
            humidityNight: ""
        },
            {
                tempDay: getTempDay(2),
                tempNight: getTempNight(2),
                humidity: forecastWeatherUtilities.getTransformHumidityForWeatherCom(getHumidityDay(2)),
                humidityDay: "",
                humidityNight: ""
            },
            {
                tempDay: getTempDay(3),
                tempNight: getTempNight(3),
                humidity: forecastWeatherUtilities.getTransformHumidityForWeatherCom(getHumidityDay(3)),
                humidityDay: "",
                humidityNight: ""
            }];
    weatherComData[city] = {
        loadTime: loadTime,
        forecast: forecast
    };
    if ((typeof oldWeatherComData) !== "object") {
        fs.writeFileSync(path, JSON.stringify(weatherComData));
        return weatherComData[city]["forecast"]
    }
    oldWeatherComData[city] = weatherComData[city];
    fs.writeFileSync(path, JSON.stringify(oldWeatherComData));
    return weatherComData[city]["forecast"];
}

module.exports = {
    getForecastWeather: getWeatherComDataWeatherForThreeDay
};