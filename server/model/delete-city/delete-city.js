const commonUtils = require("../common-utilities");

async function deleteCity(city, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            let deleteCity = `DELETE FROM USERS_CITIES  WHERE USER_ID='${userId}' AND CITY='${city}'`;
            await commonUtils.execAsync(deleteCity);
            resolve(true);
        } catch (error) {
            console.error(error);
            reject("Technical issue");
        }
    })
}

module.exports = {
    deleteCity: deleteCity
}
