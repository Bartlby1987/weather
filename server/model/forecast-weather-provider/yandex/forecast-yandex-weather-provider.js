const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtil = require("../forecast-weather-utilities");
const MAIN_PAGE_URL = `https://yandex.ru/pogoda/search?request=`;
const DETAIL_PAGE_URL = "https://yandex.ru/pogoda/details?";
const HREF_ATR_SELECTOR = "body > div > div> div> div > div> div > li:nth-child(1) > a";
const generateDayTempSelector = (value) => `body > div.b-page__container > div.content > div.forecast-details-segment > div` +
    `> div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(1) >` +
    `td.weather-table__body-cell.weather-table__body-cell_type_daypart.weather-table__body-cell_wrapper > div >` +
    `div.weather-table__temp > div:nth-child(1) > span.temp__value`
const generateNightTempSelector = (value) => `body > div.b-page__container > div.content > div.forecast-details-segment >` +
    `div > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(4) >` +
    `td.weather-table__body-cell.weather-table__body-cell_type_daypart.weather-table__body-cell_wrapper > div >` +
    `div.weather-table__temp > div:nth-child(1) > span.temp__value`
const generateHumidityDaySelector = (value) => `body > div.b-page__container > div.content > div.forecast-details-segment` +
    `> div > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(1) >` +
    `td.weather-table__body-cell.weather-table__body-cell_type_condition`
const generateHumidityNightSelector = (value) => `body > div.b-page__container > div.content > div.forecast-details-segment` +
    `> div > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(4) >` +
    `td.weather-table__body-cell.weather-table__body-cell_type_condition`
const FIRST_DAY_VALUE = 3;
const SECOND_DAY_VALUE = 4;
const THIRD_DAY_VALUE = 5;
const INDEX_FOR_REPLACE = "/pogoda/?";
const mappingProvider = [{"dayValue": FIRST_DAY_VALUE}, {"dayValue": SECOND_DAY_VALUE}, {"dayValue": THIRD_DAY_VALUE}];
function getForecastWeather(city) {
    let mainPageUrl = encodeURI(MAIN_PAGE_URL + city);
    let res = request('GET', mainPageUrl, {});
    let htmlDataPage = cheerio.load(res.body);
    let href = htmlDataPage(HREF_ATR_SELECTOR).attr("href");
    href = href.replace(INDEX_FOR_REPLACE, "");
    let detailPageUrl = DETAIL_PAGE_URL + href;
    detailPageUrl = encodeURI(detailPageUrl);
    let rest = request('GET', detailPageUrl, {});
    let htmlDetailPage = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        let tempDay = htmlDetailPage(generateDayTempSelector(dayValue)).text();
        if (tempDay === "") {
            return undefined
        } else {
            return tempDay
        }
    }

    function getTempNight(dayValue) {
        let tempNight = htmlDetailPage(generateNightTempSelector(dayValue)).text();
        if (tempNight === "") {
            return undefined
        } else {
            return tempNight
        }
    }

    function getHumidityDay(dayValue) {
        return htmlDetailPage(generateHumidityDaySelector(dayValue)).text();
    }

    function getHumidityNight(dayValue) {
        return htmlDetailPage(generateHumidityNightSelector(dayValue)).text();
    }

    return mappingProvider.map((element) => {
        return {
            tempDay: Number(getTempDay(element.dayValue)),
            tempNight: Number(getTempNight(element.dayValue)),
            humidityDay: forecastWeatherUtil.getTransformHumidity(getHumidityDay(element.dayValue)),
            humidityNight: forecastWeatherUtil.getTransformHumidity(getHumidityNight(element.dayValue))
        }
    })
}

module.exports = {
    getForecastWeather: getForecastWeather
};