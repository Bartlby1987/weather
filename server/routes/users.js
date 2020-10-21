const express = require('express');
const authorization = require("../model/user-authorization/authorization");
const dataBase = require("../model/user-registration/registration-database");
const {saveProperties} = require("../model/save-properties/save-sources");
const {loadUserInfo} = require("../model/load-weather-data/load-weather-data");
const {getSource} = require("../model/get-source/get-source");
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/logOut', async function (req, res) {
    try {
        req.session = null;
        res.clearCookie('ID', {path: '/'});
        res.status(200).json('User Logged out');
        await authorization.logOutFromSession();
        res.json();
    } catch (err) {
        res.json(err);
    }
});

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

router.get('/loadUserInfo', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let weatherData = await loadUserInfo(token);
        res.json(weatherData);
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

module.exports = router;
