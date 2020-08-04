const cheerio = require('cheerio');
const request = require('sync-request');

function getFullCityNameResolveByWeather(city) {
    let url = encodeURI(`https://api.openweathermap.org/data/2.5/weather?q=${city},&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e&lang=ru`);
    let res = request('GET', url);
    if (res.statusCode === 404) {
        return ""
    } else {
        return (JSON.parse((cheerio.load(res.getBody())).text())).name;
    }
}

// console.log(getFullCityNameResolveByWeather("Вильнюс"));
module.exports = {
    getFullCityNameResolveByWeather:  getFullCityNameResolveByWeather
};