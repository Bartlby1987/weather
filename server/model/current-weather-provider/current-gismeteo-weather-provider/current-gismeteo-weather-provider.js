const cheerio = require('cheerio');
const request = require('sync-request');
const cityAndPageObject = require('../current-weather-utilities');

function getCurrentGismeteoData(cityName) {
    let gismeteoPage = `https://www.gismeteo.ru/search/`;
    let citiesObject = cityAndPageObject.transformStringInObject(cityName, gismeteoPage);
    let cityData = {temp: "Данных нет", humidity: "Данных нет"};
    for (let city in citiesObject) {
        let URL1 = citiesObject[city];
        let res1 = request('GET', URL1, {});
        let $$ = cheerio.load(res1.body);
        let link = $$("div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM");
        let href = link.attr("href");
        if (href !== undefined) {
            let URL = "https://www.gismeteo.ru" + href + "now/";
            let res = request('GET', URL, {});
            let $ = cheerio.load(res.body);
            let cityTemperature = ($(".js_meas_container.temperature.tab-weather__value>.unit.unit_temperature_c" +
                ">span").text()).trim();
            let cityHumidity = $(".nowinfo__item.nowinfo__item_humidity>div>.nowinfo__value").text();
            cityData.temp = cityTemperature;
            cityData.humidity = cityHumidity + "%";
        }
    }
    return cityData
}

module.exports = {
    getWeather: getCurrentGismeteoData
};