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


module.exports = {
    getTransformHumidity: getTransformHumidity,
    getTransformHumidityForWeatherCom: getTransformHumidityForWeatherCom,
    getForecastDateOnSomeAmountOfDays: getForecastDateOnSomeAmountOfDays,
    calculateAverageWeatherData: calculateAverageWeatherData
};