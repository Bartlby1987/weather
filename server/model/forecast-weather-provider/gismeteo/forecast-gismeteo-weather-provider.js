const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtilities = require("../forecast-weather-utilities");
const GISMETEO_SEARCH_PAGE = "https://www.gismeteo.ru/search/";
const HREF_GISMETEO_SELECTOR = "body > section > div.content_wrap.countries > div > section > div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM";
const GISMETEO_FIRST_PATH_PAGE = "https://www.gismeteo.ru"
const GISMETEO_SECOND_PATH_PAGE = "3-days/#2-4-days";
const TEMP_DAY_FIRST_SELECTOR = "body > section > div> div > div> div > div> div> div > div.forecast_scroll > div > div._line.templine.clearfix > div > div > div:nth-child(";
const TEMP_DAY_SECOND_SELECTOR = ") > span.unit.unit_temperature_c";
const TEMP_NIGHT_FIRST_SELECTOR = "body > section > div> div > div > div > div> div> div > div> div > div._line.templine.clearfix > div > div > div:nth-child(";
const TEMP_NIGHT_SECOND_SELECTOR = ") > span.unit.unit_temperature_c";
const HUMIDITY_NIGHT_FIRST_SELECTOR = "body > section > div> div > div> div > div> div> div > div> div > div._line.iconline.clearfix > div:nth-child(";
const HUMIDITY_NIGHT_SECOND_SELECTOR = ") > div > span";
const HUMIDITY_DAY_FIRST_SELECTOR = "body > section > div > div > div > div > div> div> div > div.forecast_scroll > div > div._line.iconline.clearfix > div:nth-child(";
const HUMIDITY_DAY_SECOND_SELECTOR = ") > div > span";
const ATTR = "data-text";

function getGismeteoDataWeatherForThreeDay(city) {
    let gismeteoSearchPage = GISMETEO_SEARCH_PAGE + city;
    gismeteoSearchPage = encodeURI(gismeteoSearchPage);
    let res = request('GET', gismeteoSearchPage, {});
    let $$ = cheerio.load(res.body);
    let href = JSON.stringify($$(HREF_GISMETEO_SELECTOR).attr("href"));
    let gismeteoCityPage = GISMETEO_FIRST_PATH_PAGE + href + GISMETEO_SECOND_PATH_PAGE;
    gismeteoCityPage = gismeteoCityPage.replace(/["']/g, '');
    let rest = request('GET', gismeteoCityPage, {});
    let $ = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        return $(TEMP_DAY_FIRST_SELECTOR + dayValue + TEMP_DAY_SECOND_SELECTOR).text();
    }

    function getTempNight(dayValue) {
        return $(TEMP_NIGHT_FIRST_SELECTOR + dayValue + TEMP_NIGHT_SECOND_SELECTOR).text();
    }

    function getHumidityDay(dayValue) {
        return $(HUMIDITY_DAY_FIRST_SELECTOR + dayValue + HUMIDITY_DAY_SECOND_SELECTOR).attr(ATTR).trim();
    }

    function getHumidityNight(dayValue) {
        return $(HUMIDITY_NIGHT_FIRST_SELECTOR + dayValue + HUMIDITY_NIGHT_SECOND_SELECTOR).attr(ATTR).trim();
    }

    function getParsingHumidity(humidityString) {
        return humidityString.replace(/[\s,<nobr/>]/g, " ").trim();
    }

    return [
        {
            tempDay: Number(getTempDay(7)),
            tempNight: Number(getTempNight(5)),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityDay(7))),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityNight(7)))
        },
        {
            tempDay: Number(getTempDay(11)),
            tempNight: Number(getTempNight(9)),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityDay(11))),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityNight(11)))
        },
        {
            tempDay: Number(getTempDay(15)),
            tempNight: Number(getTempNight(13)),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityDay(15))),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityNight(15)))
        },
    ]
}

module.exports = {
    getForecastWeather: getGismeteoDataWeatherForThreeDay
};