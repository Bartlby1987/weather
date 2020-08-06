const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');
const constants = require('../../constant-list');
const yandexPage = `https://yandex.ru/pogoda/search?request=`;
const yandexSearchSelector = "body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a";
const yandexPageSelector = "https://yandex.ru";
const temperatureSelector = ".temp.fact__temp.fact__temp_size_s>.temp__value";
const humiditySelector = ".term.term_orient_v.fact__humidity > .term__value";

function getCurrentYandexData(cityName) {
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, yandexPage);
    let cityData = {temp: constants.noData, humidity: constants.noData};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        let link = $$(yandexSearchSelector);
        let href = link.attr("href");
        if (href !== undefined) {
            let URL = yandexPageSelector + href;
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            let cityTemperature = $(temperatureSelector).text();
            let cityHumidity = $(humiditySelector).text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity;
        }
    }
    return cityData;
}
module.exports = {
    getWeather: getCurrentYandexData
};