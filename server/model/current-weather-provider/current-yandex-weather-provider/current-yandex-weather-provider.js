const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');

function getCurrentYandexData(cityName) {
    let yandexPage = `https://yandex.ru/pogoda/search?request=`;
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, yandexPage);
    let cityData = {};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        let link = $$("body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > " +
            "div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a");
        let href = link.attr("href");
        if (href !== undefined) {
            let URL = "https://yandex.ru" + href;
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            let cityTemperature = $(".temp.fact__temp.fact__temp_size_s>.temp__value").text();
            let cityHumidity = $(".term.term_orient_v.fact__humidity > .term__value").text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity;
        }
    }
    return cityData;
}
module.exports = {
    getWeather: getCurrentYandexData
};