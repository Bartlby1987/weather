const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtilities = require("../forecast-weather-utilities");
const GISMETEO_SEARCH_PAGE = "https://www.gismeteo.ru/search/";
const HREF_GISMETEO_SELECTOR = "body > section > div.content_wrap.countries > div > section > div > div > " +
    "div:nth-child(1) > a.catalog_link.link.blue.fontM";
const generateGismeteoPage = (value) => `https://www.gismeteo.ru${value}3-days/#2-4-days `;
const generateTempDaySelector = (value) => `body > section > div> div > div> div > div> div> div > div.forecast_scroll > div 
                    > div._line.templine.clearfix > div > div > div:nth-child(${value}) > span.unit.unit_temperature_c`;
const generateTempNightSelector = (value) => `body > section > div> div > div > div > div> div> div > div> div > 
                      div._line.templine.clearfix > div > div > div:nth-child(${value}) > span.unit.unit_temperature_c`;
const generateHumidityNightSelector = (value) => `body > section > div> div > div> div > div> div> div > div> div > 
                                            div._line.iconline.clearfix > div:nth-child(${value}) > div > span`;
const generateHumidityDaySelector = (value) => `body > section > div > div > div > div > div> div> div > div.forecast_scroll >
                                              div > div._line.iconline.clearfix > div:nth-child(${value}) > div > span`;
const ATTR = "data-text";
const FIRST_DAY_VALUE = 7;
const FIRST_TEMP_NIGHT_VALUE = 5;
const SECOND_DAY_VALUE = 11;
const SECOND_TEMP_NIGHT_VALUE = 9;
const THIRD_DAY_VALUE = 15;
const THIRD_TEMP_NIGHT_VALUE = 13;

function getGismeteoDataWeatherForThreeDay(city) {
    let gismeteoSearchPage = GISMETEO_SEARCH_PAGE + city;
    gismeteoSearchPage = encodeURI(gismeteoSearchPage);
    let res = request('GET', gismeteoSearchPage, {});
    let HTMLGismeteoSearchPage = cheerio.load(res.body);
    let href = JSON.stringify(HTMLGismeteoSearchPage(HREF_GISMETEO_SELECTOR).attr("href"));
    let gismeteoCityPage = generateGismeteoPage(href);
    gismeteoCityPage = gismeteoCityPage.replace(/["']/g, '');
    let rest = request('GET', gismeteoCityPage, {});
    let HTMLGismeteoPage = cheerio.load(rest.body);
    function getTempDay(dayValue) {
        return HTMLGismeteoPage(generateTempDaySelector(dayValue)).text();
    }

    function getTempNight(dayValue) {
        return HTMLGismeteoPage(generateTempNightSelector(dayValue)).text();
    }

    function getHumidityDay(dayValue) {
        return HTMLGismeteoPage(generateHumidityDaySelector(dayValue)).attr(ATTR).trim();
    }

    function getHumidityNight(dayValue) {
        return HTMLGismeteoPage(generateHumidityNightSelector(dayValue)).attr(ATTR).trim();
    }

    function getParsingHumidity(humidityString) {
        return humidityString.replace(/[\s,<nobr/>]/g, " ").trim();
    }

    return [
        {
            tempDay: Number(getTempDay(FIRST_DAY_VALUE)),
            tempNight: Number(getTempNight(FIRST_TEMP_NIGHT_VALUE)),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityDay(FIRST_DAY_VALUE))),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityNight(FIRST_DAY_VALUE)))
        },
        {
            tempDay: Number(getTempDay(SECOND_DAY_VALUE)),
            tempNight: Number(getTempNight(SECOND_TEMP_NIGHT_VALUE)),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityDay(SECOND_DAY_VALUE))),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityNight(SECOND_DAY_VALUE)))
        },
        {
            tempDay: Number(getTempDay(THIRD_DAY_VALUE)),
            tempNight: Number(getTempNight(THIRD_TEMP_NIGHT_VALUE)),
            humidityDay: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityDay(THIRD_DAY_VALUE))),
            humidityNight: forecastWeatherUtilities.getTransformHumidity(getParsingHumidity(getHumidityNight(THIRD_DAY_VALUE)))
        },
    ]
}

module.exports = {
    getForecastWeather: getGismeteoDataWeatherForThreeDay
};