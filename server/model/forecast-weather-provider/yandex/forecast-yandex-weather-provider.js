const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtilities = require("../forecast-weather-utilities");
const YANDEX_PAGE = `https://yandex.ru/pogoda/search?request=`;
const DETAIL_YANDEX_PAGE = "https://yandex.ru/pogoda/segment/details?via=srp&cameras=0&geoid=";
const TEMP_DAY_FIRST_SELECTOR = "body > div > div:nth-child(";
const TEMP_DAY_SECOND_SELECTOR = ") > dd > table > tbody > tr:nth-child(2) > td.weather-table__body-cell.weather-table__body-cell_type_feels-like > div";
const TEMP_NIGHT_FIRST_SELECTOR = "body > div > div:nth-child(";
const TEMP_NIGHT_SECOND_SELECTOR = ") > dd > table > tbody > tr:nth-child(4) > td.weather-table__body-cell.weather-table__body-cell_type_feels-like > div";
const HUMIDITY_DAY_FIRST_SELECTOR = "body > div > div:nth-child(";
const HUMIDITY_DAY_SECOND_SELECTOR = ") > dd > table > tbody > tr:nth-child(2) > td.weather-table__body-cell.weather-table__body-cell_type_condition";
const HREF_ATR_SELECTOR = "body > div > div> div> div > div> div > li:nth-child(1) > a";
const HUMIDITY_NIGHT_FIRST_SELECTOR = "body > div > div:nth-child(";
const HUMIDITY_NIGHT_SECOND_SELECTOR = ") > dd > table > tbody > tr:nth-child(4) > td.weather-table__body-cell.weather-table__body-cell_type_condition";
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
        let tempDay = HTMLDetailYandexPage(TEMP_DAY_FIRST_SELECTOR + dayValue + TEMP_DAY_SECOND_SELECTOR).text();
        if (tempDay === "") {
            return undefined
        } else {
            return tempDay
        }
    }

    function getTempNight(dayValue) {
        let tempNight = HTMLDetailYandexPage(TEMP_NIGHT_FIRST_SELECTOR + dayValue + TEMP_NIGHT_SECOND_SELECTOR).text();
        if (tempNight === "") {
            return undefined
        } else {
            return tempNight
        }
    }

    function getHumidityDay(dayValue) {
        return HTMLDetailYandexPage(HUMIDITY_DAY_FIRST_SELECTOR + dayValue + HUMIDITY_DAY_SECOND_SELECTOR).text();
    }

    function getHumidityNight(dayValue) {
        return HTMLDetailYandexPage(HUMIDITY_NIGHT_FIRST_SELECTOR + dayValue + HUMIDITY_NIGHT_SECOND_SELECTOR).text();
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

