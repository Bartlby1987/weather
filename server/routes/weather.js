let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let currentWeatherProvider = require('../model/current-weather-provider/current-weather-provider.js');
let forecastCache = require('../cache/forecast-cache.js');
const dataBase = require("../model/user-registration/registration-database");
const authorization = require("../model/user-authorization/authorization");
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