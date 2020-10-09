let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let currentWeatherProvider = require('../model/current-weather-provider/current-weather-provider.js');
let forecastCache = require('../cache/forecast-cache.js');
const dataBase = require("../model/user-registration/registration-database");
const authorization = require("../model/user-authorization/authorization");
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
        req.session = null
        res.clearCookie('ID', {path: '/'})
        res.status(200).json('User Logged out')
        await authorization.logOutFromSession(token);
        res.json()
    } catch (err) {
        res.json(err)
    }
});

router.post('/authorization', async function (req, res) {
    let loginPassword = req.body;
    try {
        let authorizationInfo = await authorization.authorizeUser(loginPassword);
        res.setHeader(`Set-Cookie`, `ID=${authorizationInfo["id"]}; HttpOnly; Path=/`)
        res.json(authorizationInfo);
    } catch (err) {
        res.json(err)
    }
});

router.post('/current', async function (req, res) {
    try {
        let token = req.cookies.ID;
        let weatherCityData = await currentWeatherProvider.getCurrentWeather(token);
        res.json(weatherCityData);
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

router.post('/forecast', function (req, res) {
    try {
        let citiesAndSource = req.body;
        let weatherCityDataOnThreeDay = forecastCache.getForecast(citiesAndSource);
        res.json(weatherCityDataOnThreeDay);
    } catch (err) {
        res.json(err)
    }
});


module.exports = router;