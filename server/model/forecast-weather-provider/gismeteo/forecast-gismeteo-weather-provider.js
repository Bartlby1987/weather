const request = require('sync-request');
const cheerio = require('cheerio');
const forecastWeatherUtils = require("../forecast-weather-utilities");
const URL_SEARCH_PAGE = "https://www.gismeteo.ru/search/";
const HREF_SELECTOR = "body > section > div.content_wrap.countries > div > section > div > div > " +
    "div:nth-child(1) > a.catalog_link.link.blue.fontM";
const generateUrlDataPage = (value) => `https://www.gismeteo.ru${value}3-days/#2-4-days `;
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
const mappingProvider = [
    {
        dayIndex: FIRST_DAY_VALUE,
        tempNightIndex: FIRST_TEMP_NIGHT_VALUE
    }, {
        dayIndex: SECOND_DAY_VALUE,
        tempNightIndex: SECOND_TEMP_NIGHT_VALUE
    }, {
        dayIndex: THIRD_DAY_VALUE,
        tempNightIndex: THIRD_TEMP_NIGHT_VALUE
    }
]

function getForecastWeather(city) {
    let urlSearchPageByCity = encodeURI(URL_SEARCH_PAGE + city);
    let res = request('GET', urlSearchPageByCity, {});
    let htmlSearchPage = cheerio.load(res.body);
    let href = htmlSearchPage(HREF_SELECTOR).attr("href");
    let urlDataPage = generateUrlDataPage(href);
    let rest = request('GET', urlDataPage, {});
    let htmlPage = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        return htmlPage(generateTempDaySelector(dayValue)).text();
    }

    function getTempNight(dayValue) {
        return htmlPage(generateTempNightSelector(dayValue)).text();
    }

    function getHumidityDay(dayValue) {
        const attrValue = htmlPage(generateHumidityDaySelector(dayValue)).attr(ATTR).trim();
        return parseAttrHumidity(attrValue);
    }

    function getHumidityNight(dayValue) {
        const attrValue = htmlPage(generateHumidityNightSelector(dayValue)).attr(ATTR).trim();
        return parseAttrHumidity(attrValue);
    }

    function parseAttrHumidity(humidityString) {
        return humidityString.replace(/[\s,<nobr/>]/g, " ").trim();
    }

    return mappingProvider.map((element) => {
        return {
            tempDay: Number(getTempDay(element.dayIndex)),
            tempNight: Number(getTempNight(element.tempNightIndex)),
            humidityDay: forecastWeatherUtils.getTransformHumidity(getHumidityDay(element.dayIndex)),
            humidityNight: forecastWeatherUtils.getTransformHumidity(getHumidityNight(element.dayIndex))
        }
    })
}

module.exports = {
    getForecastWeather: getForecastWeather
};