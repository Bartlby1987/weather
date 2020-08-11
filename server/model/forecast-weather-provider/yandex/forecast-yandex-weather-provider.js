const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtilities = require("../forecast-weather-utilities");
const YANDEX_PAGE = `https://yandex.ru/pogoda/search?request=`;
const DETAIL_YANDEX_PAGE = "https://yandex.ru/pogoda/segment/details?via=srp&cameras=0&geoid=";
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
const STRING_BREAK_SIGN = "°";
const FIRST_STRING_ELEMENT = 0;

function getYandexDataWeatherForThreeDay(city) {
    let yandexPage = YANDEX_PAGE + city;
    yandexPage = encodeURI(yandexPage);
    let res = request('GET', yandexPage, {});
    let HTMLYandexPage = cheerio.load(res.body);
    let href = HTMLYandexPage(HREF_ATR_SELECTOR).attr("href");
    let cityNumber = href.replace(/\D/g, '');
    let detailWeatherPage = DETAIL_YANDEX_PAGE + cityNumber;
    detailWeatherPage = encodeURI(detailWeatherPage);
    let rest = request('GET', detailWeatherPage, {});
    let HTMLDetailYandexPage = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        let tempDay = HTMLDetailYandexPage(generateFirstDaySelector(dayValue)).text();
        if (tempDay === "") {
            return undefined
        } else {
            return tempDay
        }
    }

    function getTempNight(dayValue) {
        let tempNight = HTMLDetailYandexPage(generateSecondDaySelector(dayValue)).text();
        if (tempNight === "") {
            return undefined
        } else {
            return tempNight
        }
    }

    function getHumidityDay(dayValue) {
        return HTMLDetailYandexPage(generateHumidityDaySelector(dayValue)).text();
    }

    function getHumidityNight(dayValue) {
        return HTMLDetailYandexPage(generateHumidityNightSelector(dayValue)).text();
    }
    return [
        {
            tempDay: Number((getTempDay(FIRST_DAY_VALUE)).split(STRING_BREAK_SIGN)[FIRST_STRING_ELEMENT]),
            tempNight: Number((getTempNight(FIRST_DAY_VALUE)).split(STRING_BREAK_SIGN)[FIRST_STRING_ELEMENT]),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getHumidityDay(FIRST_DAY_VALUE)),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getHumidityNight(FIRST_DAY_VALUE))
        },
        {
            tempDay: Number((getTempDay(SECOND_DAY_VALUE)).split(STRING_BREAK_SIGN)[FIRST_STRING_ELEMENT]),
            tempNight: Number((getTempNight(SECOND_DAY_VALUE)).split(STRING_BREAK_SIGN)[FIRST_STRING_ELEMENT]),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getHumidityDay(SECOND_DAY_VALUE)),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getHumidityNight(SECOND_DAY_VALUE))
        },
        {
            tempDay: Number((getTempDay(THIRD_DAY_VALUE)).split(STRING_BREAK_SIGN)[FIRST_STRING_ELEMENT]),
            tempNight: Number((getTempNight(THIRD_DAY_VALUE)).split(STRING_BREAK_SIGN)[FIRST_STRING_ELEMENT]),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getHumidityDay(THIRD_DAY_VALUE)),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getHumidityNight(THIRD_DAY_VALUE))
        },
    ];
}

module.exports = {
    getForecastWeather: getYandexDataWeatherForThreeDay
};