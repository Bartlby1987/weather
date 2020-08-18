const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtil = require("../forecast-weather-utilities");
const MAIN_PAGE_URL = `https://yandex.ru/pogoda/search?request=`;
const FORECAST_PAGE_URL = "https://yandex.ru/pogoda/details?";
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
const PART_URL_FOR_REPLACEMENT = "/pogoda/?";
const mappingProvider = [{"dayValue": FIRST_DAY_VALUE}, {"dayValue": SECOND_DAY_VALUE}, {"dayValue": THIRD_DAY_VALUE}];

function getTempDay(dayValue, forecastPageHtml) {
    let tempDay = forecastPageHtml(generateDayTempSelector(dayValue)).text();
    if (tempDay === "") {
        return undefined
    } else {
        return tempDay
    }
}

function getTempNight(dayValue, forecastPageHtml) {
    let tempNight = forecastPageHtml(generateNightTempSelector(dayValue)).text();
    if (tempNight === "") {
        return undefined
    } else {
        return tempNight
    }
}

function getHumidityDay(dayValue, forecastPageHtml) {
    return forecastPageHtml(generateHumidityDaySelector(dayValue)).text();
}

function getHumidityNight(dayValue, forecastPageHtml) {
    return forecastPageHtml(generateHumidityNightSelector(dayValue)).text();
}

function constructSearchPageUrlByCity(city) {
    return encodeURI(MAIN_PAGE_URL + city);
}

function extractSearchPageHtmlByCity(searchPageUrl) {
    let res = request('GET', searchPageUrl, {});
    return cheerio.load(res.body);
}

function constructForecastPageUrlByCity(searchPageHtml) {
    let href = searchPageHtml(HREF_ATR_SELECTOR).attr("href");
    href = href.replace(PART_URL_FOR_REPLACEMENT, "");
    let forecastPageUrl = FORECAST_PAGE_URL + href;
    return encodeURI(forecastPageUrl);
}

function extractForecastPageHtmlByCity(forecastPageUrl) {
    let rest = request('GET', forecastPageUrl, {});
    return cheerio.load(rest.body);
}

function parseForecastPageHtmlByCity(forecastPageHtml) {
    return mappingProvider.map((element) => {
        return {
            tempDay: Number(getTempDay(element.dayValue, forecastPageHtml)),
            tempNight: Number(getTempNight(element.dayValue, forecastPageHtml)),
            humidityDay: forecastWeatherUtil.getTransformHumidity(getHumidityDay(element.dayValue, forecastPageHtml)),
            humidityNight: forecastWeatherUtil.getTransformHumidity(getHumidityNight(element.dayValue, forecastPageHtml))
        }
    })
}

function getForecastWeather(city) {
    let searchPageUrl = constructSearchPageUrlByCity(city);
    let searchPageHtml = extractSearchPageHtmlByCity(searchPageUrl);
    let forecastPageUrl = constructForecastPageUrlByCity(searchPageHtml);
    let forecastPageHtml = extractForecastPageHtmlByCity(forecastPageUrl);
    return parseForecastPageHtmlByCity(forecastPageHtml);
}

module.exports = {
    getForecastWeather: getForecastWeather
};