const express = require('express');
const authorization = require("../model/user-authorization/authorization");
const dataBase = require("../model/user-registration/registration-database");
const {getUserId} = require("../model/common-utilities");
const {saveProperties} = require("../model/save-properties/save-sources");
const {loadUserInfo} = require("../model/load-weather-data/load-weather-data");
const {getSource} = require("../model/get-source/get-source");
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/logout', async function (req, res) {
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
        let userId = await getUserId(token);
        if (!token || !userId) {
            res.send()
        }
        res.json({"USER_ID": userId})
    } catch (err) {
        console.error(err);
        res.json("Internal Server Error.")
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
        let userId = await getUserId(token);
        if (userId) {
            let weatherData = await loadUserInfo(userId);
            res.json(weatherData);
        }
    } catch (err) {
        res.json(err)
    }
});

router.get('/getSource', async function (req, res) {
    let token = req.cookies.ID;
    try {
        let userId = await getUserId(token);
        if (userId) {
            let source = await getSource(userId);
            res.json(source);
        }
    } catch (err) {
        res.json(err)
    }
});

router.post('/saveProperties', async function (req, res) {
    let source = req.body;
    let token = req.cookies.ID;
    try {
        let userId = await getUserId(token);
        if (userId) {
            let msg = await saveProperties(source, userId);
            res.json(msg)
        }
    } catch (error) {
        res.json(error)
    }
});

module.exports = router;
