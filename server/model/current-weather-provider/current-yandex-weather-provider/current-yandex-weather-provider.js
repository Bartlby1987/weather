const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');
const constants = require('../../constant-list');
const YANDEX_SEARCH_PAGE = `https://yandex.ru/pogoda/search?request=`;
const YANDEX_SEARCH_SELECTOR = "body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a";
const YANDEX_PAGE_SELECTOR = "https://yandex.ru";
const TEMPERATURE_SELECTOR = ".temp.fact__temp.fact__temp_size_s>.temp__value";
const HUMIDITY_SELECTOR = ".term.term_orient_v.fact__humidity > .term__value";

function getCurrentYandexData(cityName) {
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, YANDEX_SEARCH_PAGE);
    let cityData = {temp: constants.noData, humidity: constants.noData};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        let link = $$(YANDEX_SEARCH_SELECTOR);
        let href = link.attr("href");
        if (href !== undefined) {
            let URL = YANDEX_PAGE_SELECTOR + href;
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            let cityTemperature = $(TEMPERATURE_SELECTOR).text();
            let cityHumidity = $(HUMIDITY_SELECTOR).text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity;
        }
    }
    return cityData;
}
module.exports = {
    getWeather: getCurrentYandexData
};