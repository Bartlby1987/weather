const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtil = require("../forecast-weather-utilities");
const MAIN_URL_PAGE = `https://yandex.ru/pogoda/search?request=`;
const DETAIL_URL_PAGE = "https://yandex.ru/pogoda/segment/details?via=srp&cameras=0&geoid=";
const HREF_ATR_SELECTOR = "body > div > div> div> div > div> div > li:nth-child(1) > a";
const generateFirstDaySelector = (value) => `body > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(2) > 
                                         td.weather-table__body-cell.weather-table__body-cell_type_feels-like > div`
const generateSecondDaySelector = (value) => `body > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(4) > 
                                          td.weather-table__body-cell.weather-table__body-cell_type_feels-like > div`
const generateHumidityDaySelector = (value) => `body > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(2) 
                                           > td.weather-table__body-cell.weather-table__body-cell_type_condition`
const generateHumidityNightSelector = (value) => `body > div > div:nth-child(${value}) > dd > table > tbody > tr:nth-child(4) 
                                             > td.weather-table__body-cell.weather-table__body-cell_type_condition`
const FIRST_DAY_VALUE = 2;
const SECOND_DAY_VALUE = 4;
const THIRD_DAY_VALUE = 5;
const STRING_SEPARATOR = "°";
const FIRST_STRING_ELEMENT = 0;
const mappingProvider = [{"dayValue": FIRST_DAY_VALUE}, {"dayValue": SECOND_DAY_VALUE}, {"dayValue": THIRD_DAY_VALUE}];

function getForecastWeather(city) {
    let mainUrlPage = encodeURI(MAIN_URL_PAGE + city);
    let res = request('GET', mainUrlPage, {});
    let htmlDataPage = cheerio.load(res.body);
    let href = htmlDataPage(HREF_ATR_SELECTOR).attr("href");
    let cityNumber = href.replace(/\D/g, '');
    let detailUrlPage = DETAIL_URL_PAGE + cityNumber;
    detailUrlPage = encodeURI(detailUrlPage);
    let rest = request('GET', detailUrlPage, {});
    let htmlDetailPage = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        let tempDay = htmlDetailPage(generateFirstDaySelector(dayValue)).text();
        if (tempDay === "") {
            return undefined
        } else {
            return tempDay.split(STRING_SEPARATOR)[FIRST_STRING_ELEMENT]
        }
    }

    function getTempNight(dayValue) {
        let tempNight = htmlDetailPage(generateSecondDaySelector(dayValue)).text();
        if (tempNight === "") {
            return undefined
        } else {
            return tempNight.split(STRING_SEPARATOR)[FIRST_STRING_ELEMENT]
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