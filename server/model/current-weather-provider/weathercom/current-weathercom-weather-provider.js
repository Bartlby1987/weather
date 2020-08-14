const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const constants = require('../../constant-list');
let path = __dirname + '/weathercom-current-cache.json';
const API_REQUEST = (value) => `https://api.openweathermap.org/data/2.5/weather?q=${value}` +
    `,&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e`;
const CACHE_LIFETIME_LIMIT_IN_MILLISECONDS = 60 * 60 * 1000;
const ABSOLUT_ZERO_IN_FAHRENHEIT = 273;

function getWeather(city) {
    let cityData = {};
    let cacheData = fs.readFileSync(path, "utf8");
    if (cacheData === "") {
        cacheData = {};
    } else {
        cacheData = JSON.parse(cacheData)
    }
    let realTime = new Date().getTime();
    if (!cacheData[city] || (cacheData[city]["lastUpdated"] - realTime) > CACHE_LIFETIME_LIMIT_IN_MILLISECONDS) {
        let apiRequestUrl = encodeURI(API_REQUEST(city));
        let res = request('GET', apiRequestUrl);
        if (res.statusCode !== 200) {
            return {temp: constants.NO_DATA, humidity: constants.NO_DATA};
        }
        let jsonDataAPI = (cheerio.load(res.getBody()));
        let jsonData = jsonDataAPI.text();
        let jsonObj = JSON.parse(jsonData);
        let humidity = jsonObj.main.humidity;
        let temp = Math.trunc(Number(jsonObj.main.temp) - ABSOLUT_ZERO_IN_FAHRENHEIT);
        if (temp > 0) {
            temp = "+" + temp;
        } else if (temp === 0) {
            temp = "0";
        }
        cacheData[city] = {
            "temp": temp,
            "humidity": humidity + "%",
            "lastUpdated": realTime
        };
        fs.writeFileSync(path, JSON.stringify(cacheData));
        cityData.temp = temp;
        cityData.humidity = humidity + "%";
    } else {
        cityData.temp = cacheData[city]["temp"];
        cityData.humidity = cacheData[city]["humidity"]
    }
    return cityData
}

module.exports = {
    getWeather: getWeather
};