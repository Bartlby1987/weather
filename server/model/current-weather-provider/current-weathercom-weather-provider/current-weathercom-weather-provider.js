const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const constants = require('../../constant-list');
let path = __dirname + '/weathercom-current-cache.json';
const weatherComKey = `,&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e`;
const weatherAPIRequest = `https://api.openweathermap.org/data/2.5/weather?q=`;

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
        let url = encodeURI(`${weatherAPIRequest}${city}${weatherComKey}`);
        let res = request('GET', url);
        if (res.statusCode!==200){
            return {temp: constants.noData, humidity: constants.noData};
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