const cheerio = require('cheerio');
const request = require('sync-request');
const yandexSearchPage = `https://yandex.ru/pogoda/search?request=`;
const pageSelector = "body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a";

function getFullCityNameResolve(addCity) {
    URL = yandexSearchPage + addCity;
    URL = encodeURI(URL);
    let res = request('GET', URL, {});
    let $ = cheerio.load(res.body);
    let file = $(pageSelector).text();
    file = file.split(",")[0];
    return file
}

module.exports = {
    getFullCityNameResolve:  getFullCityNameResolve
};