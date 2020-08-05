const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');

function getCurrentYandexData(cityName) {
    const yandexPage = `https://yandex.ru/pogoda/search?request=`;
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, yandexPage);
    let cityData = {};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        const yandexSearchSelector = "body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a";
        let link = $$(yandexSearchSelector);
        let href = link.attr("href");
        if (href !== undefined) {
            const yandexPageSelector = "https://yandex.ru";
            let URL = yandexPageSelector + href;
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            const temperatureSelector = ".temp.fact__temp.fact__temp_size_s>.temp__value";
            let cityTemperature = $(temperatureSelector).text();
            const humiditySelector = ".term.term_orient_v.fact__humidity > .term__value";
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