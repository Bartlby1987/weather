const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');
const constants = require('../../constant-list');
const GISMETEO_SEARCH_PAGE = `https://www.gismeteo.ru/search/`;
const HUMIDITY_SELECTOR = ".nowinfo__item.nowinfo__item_humidity>div>.nowinfo__value";
const TEMPERATURE_SELECTOR = ".js_meas_container.temperature.tab-weather__value>.unit.unit_temperature_c>span";
const GISMETEO_PAGE = "https://www.gismeteo.ru";
const PAGE_SELECTOR = "div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM";
const PATH_OF_GISMETEO_PAGE = "now/";

function getCurrentGismeteoData(cityName) {
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, GISMETEO_SEARCH_PAGE);
    let cityData = {temp: constants.noData, humidity: constants.noData};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        let link = $$(PAGE_SELECTOR);
        let href = link.attr("href");
        if (href !== undefined) {
            let URL = GISMETEO_PAGE + href + PATH_OF_GISMETEO_PAGE;
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            let cityTemperature = ($(TEMPERATURE_SELECTOR).text()).trim();
            let cityHumidity = $(HUMIDITY_SELECTOR).text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity + "%";
        }
    }
    return cityData
}
module.exports = {
    getWeather: getCurrentGismeteoData
};