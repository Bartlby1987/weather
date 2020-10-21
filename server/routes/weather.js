const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const currentWeatherProvider = require('../model/current-weather-provider/current-weather-provider.js');
const {getForecastData} = require("../model/forecast-weather-provider/forecast-weather-provider");
const {changeForecastStatus} = require("../model/change-forecast-status/change-forecast-status");
const {deleteCity} = require("../model/delete-city/delete-city");
const {addCity} = require("../model/add-city/add-city");

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

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

router.post('/forecast', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let city = (req.body)["city"];
        let weatherCityDataOnThreeDay = await getForecastData(city, token);
        res.json(weatherCityDataOnThreeDay);
    } catch (err) {
        res.json(err)
    }
});

module.exports = router;