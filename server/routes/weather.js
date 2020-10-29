const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const currentWeatherProvider = require('../model/current-weather-provider/current-weather-provider.js');
const {getForecastData} = require("../model/forecast-weather-provider/forecast-weather-provider");
const {changeForecastStatus} = require("../model/change-forecast-status/change-forecast-status");
const {deleteCity} = require("../model/delete-city/delete-city");
const {addCity} = require("../model/add-city/add-city");
const {getUserId} = require("../model/common-utilities");


router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/current', async function (req, res) {
    try {
        let city = (req.body)["city"];
        let token = req.cookies.ID;
        let userId = await getUserId(token);
        if (userId) {
            let weatherCityData = await currentWeatherProvider.getCurrentWeather(userId, [city]);
            res.json(weatherCityData[0]);
        }
    } catch (err) {
        console.error(err);
        res.json(err)
    }
});

router.post('/changeForecast', async function (req, res) {
    try {
        let token = req.cookies.ID;
        let userId = await getUserId(token);
        if (userId) {
            let cities = req.body;
            let weatherCityData = await changeForecastStatus(cities, userId);
            res.json(weatherCityData);
        }
    } catch (err) {
        console.error(err);
        res.json(err)
    }
});

router.post('/addCity', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let userId = await getUserId(token);
        if (userId) {
            let cities = req.body;
            let weatherCityData = await addCity(cities, userId);
            res.json(weatherCityData);
        }
    } catch (err) {
        console.error(err);
        res.json(err)
    }
});

router.post('/deleteCity', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let userId = await getUserId(token);
        if (userId) {
            let cities = (req.body)["city"];
            let weatherCityData = await deleteCity(cities, userId);
            res.json(weatherCityData);
        }
    } catch (err) {
        console.error(err);
        res.json(err)
    }
});

router.post('/forecast', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let userId = await getUserId(token);
        let city = (req.body)["city"];
        let weatherCityDataOnThreeDay = await getForecastData(city, userId);
        res.json(weatherCityDataOnThreeDay);
    } catch (err) {
        console.error(err);
        res.json(err)
    }
});

module.exports = router;