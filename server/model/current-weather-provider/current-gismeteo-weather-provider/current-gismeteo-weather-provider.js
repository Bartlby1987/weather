const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');
const constants = require('../../constant-list');
const gismeteoSearchPag = `https://www.gismeteo.ru/search/`;
const humiditySelector = ".nowinfo__item.nowinfo__item_humidity>div>.nowinfo__value";
const temperatureSelector = ".js_meas_container.temperature.tab-weather__value>.unit.unit_temperature_c>span";
const gismeteoPag = "https://www.gismeteo.ru";
const pageSelector = "div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM";
const pathOfGismeteoPage = "now/";

function getCurrentGismeteoData(cityName) {
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, gismeteoSearchPag);
    let cityData = {temp: constants.noData, humidity: constants.noData};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        let link = $$(pageSelector);
        let href = link.attr("href");
        if (href !== undefined) {
            let URL = gismeteoPag + href + pathOfGismeteoPage;
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            let cityTemperature = ($(temperatureSelector).text()).trim();
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