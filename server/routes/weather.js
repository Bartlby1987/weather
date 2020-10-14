const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const currentWeatherProvider = require('../model/current-weather-provider/current-weather-provider.js');
const forecastCache = require('../cache/forecast-cache.js');
const dataBase = require("../model/user-registration/registration-database");
const authorization = require("../model/user-authorization/authorization");
const {getForecastData} = require("../model/forecast-weather-provider/forecast-weather-provider");
const {getSource} = require("../model/get-source/get-source");
const {loadUserInfo} = require("../model/load-weather-data/load-weather-data");
const {changeForecastStatus} = require("../model/change-forecast-status/change-forecast-status");
const {saveProperties} = require("../model/save-properties/save-sources");
const {deleteCity} = require("../model/delete-city/delete-city");
const {addCity} = require("../model/add-city/add-city");

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/checkSession', async function (req, res) {
    try {
        let token = req.cookies.ID;
        if (!token) {
            res.send()
        }
        let sessionInfo = await authorization.checkSession(token);
        res.json(sessionInfo)
    } catch (err) {
        res.json(err)
    }
});

router.post('/registration', async function (req, res) {
    let userInfo = req.body;
    try {
        let msg = await dataBase.addUserRegistrationInformation(userInfo);
        res.json(msg)
    } catch (error) {
        res.json(error)
    }
});

router.post('/saveProperties', async function (req, res) {
    let source = req.body;
    let token = req.cookies.ID;
    try {
        let msg = await saveProperties(source, token);
        res.json(msg)
    } catch (error) {
        res.json(error)
    }
});

router.post('/logOut', async function (req, res) {
    try {
        let token = req.cookies.ID;
        req.session = null;
        res.clearCookie('ID', {path: '/'});
        res.status(200).json('User Logged out');
        await authorization.logOutFromSession(token);
        res.json();
    } catch (err) {
        res.json(err);
    }
});

router.post('/authorization', async function (req, res) {
    let loginPassword = req.body;
    let token = req.cookies.ID;
    try {
        let authorizationInfo = await authorization.authorizeUser(loginPassword, token);
        res.setHeader(`Set-Cookie`, `ID=${authorizationInfo["id"]}; HttpOnly; Path=/`)
        res.json(authorizationInfo);
    } catch (err) {
        res.json(err)
    }
});

router.post('/current', async function (req, res) {
    try {
        let city = (req.body)["city"];
        let token = req.cookies.ID;
        let weatherCityData = await currentWeatherProvider.getCurrentWeather(token, [city]);
        res.json(weatherCityData[0]);
    } catch (err) {
        res.json(err)
    }
});

router.post('/changeForecast', async function (req, res) {
    try {
        let token = req.cookies.ID;
        let cities = req.body;
        let weatherCityData = await changeForecastStatus(cities, token);
        res.json(weatherCityData);
    } catch (err) {
        res.json(err)
    }
});

router.post('/addCity', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let cities = req.body;
        let weatherCityData = await addCity(cities, token);
        res.json(weatherCityData);
    } catch (err) {
        res.json(err)
    }
});

router.get('/loadUserInfo', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let weatherData = await loadUserInfo(token);
        res.json(weatherData);
    } catch (err) {
        res.json(err)
    }
});

router.post('/deleteCity', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let cities = (req.body)["city"];
        let weatherCityData = await deleteCity(cities, token);
        res.json(weatherCityData);
    } catch (err) {
        res.json(err)
    }
});

router.get('/getSource', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let source = await getSource(token);
        res.json(source);
    } catch (err) {
        res.json(err)
    }
});

router.post('/forecast', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let citiesAndSource = req.body;
        let weatherCityDataOnThreeDay = await getForecastData(citiesAndSource, token);
        res.json(weatherCityDataOnThreeDay);
    } catch (err) {
        res.json(err)
    }
});

module.exports = router;