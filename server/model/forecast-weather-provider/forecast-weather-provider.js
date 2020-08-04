const request = require('sync-request');
const cheerio = require('cheerio');
const fs = require("fs");
const _ = require('lodash');
const commonUtilities= require("../common-utilities");
let path = __dirname + "/weathercom-forecast-cache.json";

function getForecastDateOnSomeAmountOfDays(amountOfDays = 3) {
    let dateArray = [];
    let options = {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
    };
    for (let i = 0; i < amountOfDays; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i + 1);
        dateArray.push(date.toLocaleString("ru", options))
    }
    return dateArray
}

function getTransformHumidity(humidityData) {
    humidityData = humidityData.split(" ");
    for (let i = 0; i < humidityData.length; i++) {
        let pathDataAboutWeather = humidityData[i].toLowerCase();
        switch (pathDataAboutWeather) {
            case "ясно":
                return "Ясно";
            case "дождь" :
                return "Дождь";
            case "снег" :
                return "Снег";
        }
    }
    return "Осадки"
}

function getTransformHumidityForWeatherCom(humidityData) {
    humidityData = humidityData.split(" ");
    for (let i = 0; i < humidityData.length; i++) {
        let pathDataAboutWeather = humidityData[i].toLowerCase();
        switch (pathDataAboutWeather) {
            case "clear":
                return "Ясно";
            case "rain" :
                return "Дождь";
            case "snow" :
                return "Снег";
        }
    }
    return "Осадки"
}

function calculateAverageValue(str) {
    str = str.trim().split((" "));
    if (str.length > 1) {
        if (str[0] === str[1]) {
            return str[0];
        } else {
            return "Осадки"
        }
    } else {
        return str[0]
    }
}

function getYandexDataWeatherForThreeDay(city) {
    let yandexPage = `https://yandex.ru/pogoda/search?request=` + city;
    yandexPage = encodeURI(yandexPage);
    let res = request('GET', yandexPage, {});
    let $$ = cheerio.load(res.body);
    let href = JSON.stringify($$("body > div > div> div> div > div> div > li:nth-child(1) > a").attr("href"));
    let cityNumber = href.split("/")[2].split("?")[0];
    let detailWeatherPage = "https://yandex.ru/pogoda/segment/details?via=srp&cameras=0&geoid=" + cityNumber;
    detailWeatherPage = encodeURI(detailWeatherPage);
    let rest = request('GET', detailWeatherPage, {});
    let $ = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        let tempDay = $("body > div > div:nth-child(" + dayValue + ") > dd > table > tbody > tr:nth-child(2) > td.weather-table__body-cell.weather-table__body-cell_type_feels-like > div").text();
        if (tempDay === "") {
            return undefined
        } else {
            return tempDay
        }
    }

    function getTempNight(dayValue) {
        let tempNight = $("body > div > div:nth-child(" + dayValue + ") > dd > table > tbody > tr:nth-child(4) > td.weather-table__body-cell.weather-table__body-cell_type_feels-like > div").text();
        if (tempNight === "") {
            return undefined
        } else {
            return tempNight
        }
    }

    function getHumidityDay(dayValue) {
        return $("body > div > div:nth-child(" + dayValue + ") > dd > table > tbody > tr:nth-child(2) > td.weather-table__body-cell.weather-table__body-cell_type_condition").text();
    }

    function getHumidityNight(dayValue) {
        return $("body > div > div:nth-child(" + dayValue + ") > dd > table > tbody > tr:nth-child(4) > td.weather-table__body-cell.weather-table__body-cell_type_condition").text();
    }

    return [
        {
            tempDay: Number((getTempDay(2)).split("°")[0]),
            tempNight: Number((getTempNight(2)).split("°")[0]),
            humidityDay: getTransformHumidity(getHumidityDay(2)),
            humidityNight: getTransformHumidity(getHumidityNight(2))
        },
        {
            tempDay: Number((getTempDay(4)).split("°")[0]),
            tempNight: Number((getTempNight(4)).split("°")[0]),
            humidityDay: getTransformHumidity(getHumidityDay(4)),
            humidityNight: getTransformHumidity(getHumidityNight(4))
        },
        {
            tempDay: Number((getTempDay(5)).split("°")[0]),
            tempNight: Number((getTempNight(5)).split("°")[0]),
            humidityDay: getTransformHumidity(getHumidityDay(5)),
            humidityNight: getTransformHumidity(getHumidityNight(5))
        },
    ];
}

function getGismeteoDataWeatherForThreeDay(city) {
    let gismeteoPage = "https://www.gismeteo.ru/search/" + city;
    gismeteoPage = encodeURI(gismeteoPage);
    let res = request('GET', gismeteoPage, {});
    let $$ = cheerio.load(res.body);
    let href = JSON.stringify($$("body > section > div.content_wrap.countries > div > section > div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM").attr("href"));

    let gismeteoCityPage = "https://www.gismeteo.ru" + href + "3-days/#2-4-days";
    gismeteoCityPage = gismeteoCityPage.replace(/["']/g, '');
    let rest = request('GET', gismeteoCityPage, {});
    let $ = cheerio.load(rest.body);

    function getTempDay(dayValue) {
        return $("body > section > div> div > div> div > div> div> div > div.forecast_scroll > div > div._line.templine.clearfix > div > div > div:nth-child(" + dayValue + ") > span.unit.unit_temperature_c").text();
    }

    function getTempNight(dayValue) {
        return $("body > section > div> div > div > div > div> div> div > div> div > div._line.templine.clearfix > div > div > div:nth-child(" + dayValue + ") > span.unit.unit_temperature_c").text();
    }

    function getHumidityDay(dayValue) {
        return $("body > section > div > div > div > div > div> div> div > div.forecast_scroll > div > div._line.iconline.clearfix > div:nth-child(" + dayValue + ") > div > span").attr("data-text").trim();
    }

    function getHumidityNight(dayValue) {
        return $("body > section > div> div > div> div > div> div> div > div> div > div._line.iconline.clearfix > div:nth-child(" + dayValue + ") > div > span").attr("data-text").trim();
    }

    function getParsingHumidity(humidityString) {
        return humidityString.replace(/[\s,<nobr/>]/g, " ").trim();
    }

    return [
        {
            tempDay: Number(getTempDay(7)),
            tempNight: Number(getTempNight(5)),
            humidityDay: getTransformHumidity(getParsingHumidity(getHumidityDay(7))),
            humidityNight: getTransformHumidity(getParsingHumidity(getHumidityNight(7)))
        },
        {
            tempDay: Number(getTempDay(11)),
            tempNight: Number(getTempNight(9)),
            humidityDay: getTransformHumidity(getParsingHumidity(getHumidityDay(11))),
            humidityNight: getTransformHumidity(getParsingHumidity(getHumidityNight(11)))
        },
        {
            tempDay: Number(getTempDay(15)),
            tempNight: Number(getTempNight(13)),
            humidityDay: getTransformHumidity(getParsingHumidity(getHumidityDay(15))),
            humidityNight: getTransformHumidity(getParsingHumidity(getHumidityNight(15)))
        },
    ]
}

function getWeatherComDataWeatherForThreeDay(city) {
    let oldWeatherComData;
    let oldWeatherComCityData;
    let loadTime = new Date().getTime();
    let oldWeatherComDataStr = fs.readFileSync(path, 'utf8');
    if (oldWeatherComDataStr !== "") {
        oldWeatherComData = JSON.parse(oldWeatherComDataStr);
        oldWeatherComCityData = oldWeatherComData[city];
    }
    if ((oldWeatherComData) && (oldWeatherComData[city]) && (loadTime - oldWeatherComCityData.loadTime) < 3600000) {
        return oldWeatherComCityData.forecast
    }
    let url = encodeURI(`https://api.openweathermap.org/data/2.5/weather?q=${city},&APPID=0b58b5094eddd4fdfa4a1fe10ca5034e`);
    let res = request('GET', url, {});
    let $$ = (cheerio.load(res.getBody()));
    let jsonData = $$.text();
    let jsonObj = JSON.parse(jsonData);
    let lon = jsonObj["coord"]["lon"];
    let lat = jsonObj["coord"]["lat"];
    let apiRequest = encodeURI(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=hourly,current,minutely&appid=0b58b5094eddd4fdfa4a1fe10ca5034e`);
    let rest = request('GET', apiRequest, {});
    let $ = (cheerio.load(rest.getBody()));
    let jsonDataRequest = $.text();
    let jsonObjRequest = JSON.parse(jsonDataRequest);

    function getTempDay(dayValue) {
        return Math.round(Number(jsonObjRequest["daily"][dayValue]["temp"]["day"]));
    }

    function getTempNight(dayValue) {
        return Math.round(Number(jsonObjRequest["daily"][dayValue]["temp"] ["night"]));
    }

    function getHumidityDay(dayValue) {
        return jsonObjRequest["daily"][dayValue]["weather"][0]["main"];
    }

    let weatherComData = {};
    let forecast =
        [{
            tempDay: getTempDay(1),
            tempNight: getTempNight(1),
            humidity: getTransformHumidityForWeatherCom(getHumidityDay(1)),
            humidityDay: "",
            humidityNight: ""
        },
            {
                tempDay: getTempDay(2),
                tempNight: getTempNight(2),
                humidity: getTransformHumidityForWeatherCom(getHumidityDay(2)),
                humidityDay: "",
                humidityNight: ""
            },
            {
                tempDay: getTempDay(3),
                tempNight: getTempNight(3),
                humidity: getTransformHumidityForWeatherCom(getHumidityDay(3)),
                humidityDay: "",
                humidityNight: ""
            }];
    weatherComData[city] = {
        loadTime: loadTime,
        forecast: forecast
    };
    if ((typeof oldWeatherComData) !== "object") {
        fs.writeFileSync(path, JSON.stringify(weatherComData));
        return weatherComData[city]["forecast"]
    }
    oldWeatherComData[city] = weatherComData[city];
    fs.writeFileSync(path, JSON.stringify(oldWeatherComData));
    return weatherComData[city]["forecast"];
}

function calculateAverageWeatherData(oneDayData, date) {

    if (oneDayData.length === 1 && (oneDayData[0]["humidity"])) {
        return {
            "date": date,
            "tempDay": oneDayData[0]["tempDay"],
            "tempNight": oneDayData[0]["tempNight"],
            "humidityDay": oneDayData[0]["humidity"],
            "humidityNight": oneDayData[0]["humidity"],
        }
    } else {
        let tempDay = 0;
        let tempNight = 0;
        let humidityDay = "";
        let humidityNight = "";
        for (let i = 0; i < oneDayData.length; i++) {
            tempDay = tempDay + oneDayData[i]["tempDay"];
            tempNight = tempNight + oneDayData[i]["tempNight"];
            humidityDay = humidityDay + " " + oneDayData[i]["humidityDay"];
            humidityNight = humidityNight + " " + oneDayData[i]["humidityNight"];
        }
        return {
            "date": date,
            "tempDay": Math.round(tempDay / oneDayData.length),
            "tempNight": Math.round(tempNight / oneDayData.length),
            "humidityDay": calculateAverageValue(humidityDay),
            "humidityNight": calculateAverageValue(humidityNight)
        }
    }
}

function getForecastWeatherData(cityAndSource) {
    let city = cityAndSource.city;
    let requestedSourcesForecast = [];
    let yandexFlag = cityAndSource.citiesSource.yandexFlag;
    let gismeteoFlag = cityAndSource.citiesSource.gismeteoFlag;
    let weatherFlag = cityAndSource.citiesSource.weatherFlag;
    let date = getForecastDateOnSomeAmountOfDays();

    if (yandexFlag) {
        try {
            requestedSourcesForecast.push(getYandexDataWeatherForThreeDay(city));
        } catch (e) {
            commonUtilities.logDataLoadingError("yandex", e);
        }
    }
    if (gismeteoFlag) {
        try {

            requestedSourcesForecast.push(getGismeteoDataWeatherForThreeDay(city));
        } catch (e) {
            commonUtilities.logDataLoadingError("gismeteo", e);
        }
    }
    if (weatherFlag) {
        try {
            requestedSourcesForecast.push(getWeatherComDataWeatherForThreeDay(city))
        } catch (e) {
            commonUtilities.logDataLoadingError("weatherCom", e);
        }
    }
    if (requestedSourcesForecast.length === 0) {
        return []
    }
    let requestedSourcesForecastForDays = _.zip(...requestedSourcesForecast);
    let first = calculateAverageWeatherData(requestedSourcesForecastForDays[0], date[0]);
    let second = calculateAverageWeatherData(requestedSourcesForecastForDays[1], date[1]);
    let third = calculateAverageWeatherData(requestedSourcesForecastForDays[2], date[2]);
    return [first, second, third]
}

module.exports = {
    getForecastWeatherData: getForecastWeatherData
};