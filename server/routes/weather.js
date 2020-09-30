let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let currentWeatherProvider = require('../model/current-weather-provider/current-weather-provider.js');
let forecastCache = require('../cache/forecast-cache.js');
const dataBase = require("../model/user-registration/registration-database");
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/registration', async function (req, res) {
    let userInfo = req.body;
    try {
        let msg = await dataBase.addUserRegistrationInformation(userInfo);
        res.json(msg)
    } catch (error) {
        res.json(error)
    }
});


router.post('/current', function (req, res) {
    let cities = req.body;
    let weatherCityData = currentWeatherProvider.getCurrentWeather(cities);
    res.send(JSON.stringify(weatherCityData));
});

router.post('/forecast', function (req, res) {
    let citiesAndSource = req.body;
    let weatherCityDataOnThreeDay = forecastCache.getForecast(citiesAndSource);
    res.send(JSON.stringify(weatherCityDataOnThreeDay));
});

module.exports = router;