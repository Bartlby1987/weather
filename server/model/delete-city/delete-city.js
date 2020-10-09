const commonUtils = require("../common-utilities");

async function deleteCity(city, token) {
    return new Promise(async (resolve, reject) => {
        let userIdSql = `SELECT USER_ID FROM USERS_SESSION  WHERE ID='${token}'`;
        try {
            let userId = (await commonUtils.execAsync(userIdSql))[0]["USER_ID"];
            let deleteCity = `DELETE FROM USERS_CITIES  WHERE USER_ID='${userId}' AND CITIES='${city}'`;
            await commonUtils.execAsync(deleteCity);
            resolve(true);
        } catch (error) {
            reject("Technical issue");
        }
    })
}

module.exports = {
    deleteCity: deleteCity
}
