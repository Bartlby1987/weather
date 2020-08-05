const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');

function getCurrentGismeteoData(cityName) {
    const gismeteoSearchPag = `https://www.gismeteo.ru/search/`;
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, gismeteoSearchPag);
    let cityData = {temp: "Данных нет", humidity: "Данных нет"};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        const pageSelector = "div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM";
        let link = $$(pageSelector);
        let href = link.attr("href");
        if (href !== undefined) {
            const gismeteoPag = "https://www.gismeteo.ru";
            let URL = gismeteoPag + href + "now/";
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            const temperatureSelector = ".js_meas_container.temperature.tab-weather__value>.unit.unit_temperature_c>span";
            let cityTemperature = ($(temperatureSelector).text()).trim();
            const humiditySelector = ".nowinfo__item.nowinfo__item_humidity>div>.nowinfo__value";
            let cityHumidity = $(humiditySelector).text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity + "%";
        }
    }
    return cityData
}
module.exports = {
    getWeather: getCurrentGismeteoData
};