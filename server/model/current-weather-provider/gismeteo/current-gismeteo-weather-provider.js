const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');
const constants = require('../../constant-list');
const SEARCH_PAGE_URL = `https://www.gismeteo.ru/search/`;
const HUMIDITY_SELECTOR = ".nowinfo__item.nowinfo__item_humidity>div>.nowinfo__value";
const TEMPERATURE_SELECTOR = ".js_meas_container.temperature.tab-weather__value>.unit.unit_temperature_c>span";
const PAGE_SELECTOR = "div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM";
const PAGE_URL = (value) => `https://www.gismeteo.ru${value}now/`;

function getCurrentGismeteoData(cityName) {
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, SEARCH_PAGE_URL);
    let cityData = {temp: constants.NO_DATA, humidity: constants.NO_DATA};
    for (let city in citiesObject) {
        let searchPageUrl = citiesObject[city];
        let requestSearchPage = request('GET', searchPageUrl, {});
        let htmlSearchPage = cheerio.load(requestSearchPage.body);
        let link = htmlSearchPage(PAGE_SELECTOR);
        let href = link.attr("href");
        if (href !== undefined) {
            let mainPageUrl = PAGE_URL(href);
            let requestMainPage = request('GET', mainPageUrl, {});
            let htmlMainPage = cheerio.load(requestMainPage.body);
            let cityTemperature = (htmlMainPage(TEMPERATURE_SELECTOR).text()).trim();
            let cityHumidity = htmlMainPage(HUMIDITY_SELECTOR).text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity + "%";
        }
    }
    return cityData
}
module.exports = {
    getWeather: getCurrentGismeteoData
};