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

function getYandexDataWeatherForThreeDay(city) {
    let yandexPage = YANDEX_PAGE + city;
    yandexPage = encodeURI(yandexPage);
    let res = request('GET', yandexPage, {});
    let $$ = cheerio.load(res.body);
    let href = JSON.stringify($$(HREF_ATR_SELECTOR).attr("href"));
    let cityNumber = href.split("/")[2].split("?")[0];
    let detailWeatherPage = DETAIL_YANDEX_PAGE + cityNumber;
    detailWeatherPage = encodeURI(detailWeatherPage);
    let rest = request('GET', detailWeatherPage, {});
    let $ = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        let tempDay = $(TEMP_DAY_FIRST_SELECTOR + dayValue + TEMP_DAY_SECOND_SELECTOR).text();
        if (tempDay === "") {
            return undefined
        } else {
            return tempDay
        }
    }

    function getTempNight(dayValue) {
        let tempNight = $(TEMP_NIGHT_FIRST_SELECTOR + dayValue + TEMP_NIGHT_SECOND_SELECTOR).text();
        if (tempNight === "") {
            return undefined
        } else {
            return tempNight
        }
    }

    function getHumidityDay(dayValue) {
        return $(HUMIDITY_DAY_FIRST_SELECTOR + dayValue + HUMIDITY_DAY_SECOND_SELECTOR).text();
    }

    function getHumidityNight(dayValue) {
        return $(HUMIDITY_NIGHT_FIRST_SELECTOR + dayValue + HUMIDITY_NIGHT_SECOND_SELECTOR).text();
    }

    return [
        {
            tempDay: Number((getTempDay(2)).split("°")[0]),
            tempNight: Number((getTempNight(2)).split("°")[0]),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getHumidityDay(2)),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getHumidityNight(2))
        },
        {
            tempDay: Number((getTempDay(4)).split("°")[0]),
            tempNight: Number((getTempNight(4)).split("°")[0]),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getHumidityDay(4)),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getHumidityNight(4))
        },
        {
            tempDay: Number((getTempDay(5)).split("°")[0]),
            tempNight: Number((getTempNight(5)).split("°")[0]),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getHumidityDay(5)),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getHumidityNight(5))
        },
    ];
}

module.exports = {
    getForecastWeather: getYandexDataWeatherForThreeDay
};