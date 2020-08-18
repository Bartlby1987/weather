const weather = {
    "ясно": "Ясно",
    "дождь": "Дождь",
    "снег": "Снег"
}
function getTransformHumidity(humidityData) {
    humidityData = humidityData.split(" ");
    let pathDataAboutWeather;
    for (let i = 0; i < humidityData.length; i++) {
        let oneHumidityData = humidityData[i];
        pathDataAboutWeather = oneHumidityData.toLowerCase();
        if (weather[pathDataAboutWeather]) {
            return weather[pathDataAboutWeather]
        }
    }
    return "Осадки"
}

function calculateAverageValue(str) {
    let separateStrOnArray = str.trim().split((" "));
    if (separateStrOnArray.length > 1) {
        if (separateStrOnArray[0] === separateStrOnArray[1]) {
            return separateStrOnArray[0];
        } else {
            return "Осадки"
        }
    } else {
        return separateStrOnArray[0]
    }
}

function generateNextDates(amountOfDays = 3) {
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
    let oneDay = oneDayData[0];
    if (oneDayData.length === 1 && (oneDay["humidity"])) {
        return {
            "date": date,
            "tempDay": oneDay["tempDay"],
            "tempNight": oneDay["tempNight"],
            "humidityDay": oneDay["humidity"],
            "humidityNight": oneDay["humidity"],
        }
    } else {
        let tempDay = 0;
        let tempNight = 0;
        let humidityDay = "";
        let humidityNight = "";
        for (let i = 0; i < oneDayData.length; i++) {
            let firstDay = oneDayData[i];
            tempDay = tempDay + firstDay["tempDay"];
            tempNight = tempNight + firstDay["tempNight"];
            humidityDay = humidityDay + " " + firstDay["humidityDay"];
            humidityNight = humidityNight + " " + firstDay["humidityNight"];
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
    generateNextDates: generateNextDates,
    calculateAverageWeatherData: calculateAverageWeatherData
};

