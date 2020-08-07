const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const constants = require('../../constant-list');
let path = __dirname + '/weathercom-current-cache.json';
const WEATHER_COM_KEY = `,&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e`;
const WEATHER_API_REQUEST = `https://api.openweathermap.org/data/2.5/weather?q=`;

function getCurrentWeathercomData(city) {
    let cityData = {};
    let cacheData = fs.readFileSync(path, "utf8");
    if (cacheData === "") {
        cacheData = {};
    } else {
        cacheData = JSON.parse(cacheData)
    }
    let realTime = new Date().getTime();
    if (!cacheData[city] || (cacheData[city]["lastUpdated"] - realTime) > 3600000) {
        let url = encodeURI(`${WEATHER_API_REQUEST}${city}${WEATHER_COM_KEY}`);
        let res = request('GET', url);
        if (res.statusCode!==200){
            return {temp: constants.NO_DATA, humidity: constants.NO_DATA};
        }
        let $ = (cheerio.load(res.getBody()));
        let jsonData = $.text();
        let jsonObj = JSON.parse(jsonData);
        let humidity = jsonObj.main.humidity;
        let temp = Math.trunc(Number(jsonObj.main.temp) - 273);
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
    getWeather:  getCurrentWeathercomData
};