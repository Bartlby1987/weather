const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');
const constants = require('../../constant-list');
const SEARCH_PAGE_URL = `https://yandex.ru/pogoda/search?request=`;
const SEARCH_CITI_SELECTOR = "body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a";
const MAIN_PAGE_URL = "https://yandex.ru";
const TEMPERATURE_SELECTOR = ".temp.fact__temp.fact__temp_size_s>.temp__value";
const HUMIDITY_SELECTOR = ".term.term_orient_v.fact__humidity > .term__value";

function getWeather(cityName) {
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, SEARCH_PAGE_URL);
    let cityData = {temp: constants.NO_DATA, humidity: constants.NO_DATA};
    for (let city in citiesObject) {
        let searchPageByCityUrl = citiesObject[city];
        let requestSearchPageUrl = request('GET', searchPageByCityUrl, {});
        let htmlSearchPage = cheerio.load(requestSearchPageUrl.body);
        let link = htmlSearchPage(SEARCH_CITI_SELECTOR);
        let href = link.attr("href");
        if (href !== undefined) {
            let mainPageUrl = MAIN_PAGE_URL + href;
            let requestMainPageUrl = request('GET', mainPageUrl, {});
            let htmlMainPag = cheerio.load(requestMainPageUrl.body);
            let cityTemperature = htmlMainPag(TEMPERATURE_SELECTOR).text();
            let cityHumidity = htmlMainPag(HUMIDITY_SELECTOR).text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity;
        }
    }
    return cityData;
}
module.exports = {
    getWeather: getWeather
};