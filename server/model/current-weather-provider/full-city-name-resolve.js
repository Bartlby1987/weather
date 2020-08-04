const cheerio = require('cheerio');
const request = require('sync-request');

function getFullCityNameResolve(addCity) {
    URL = `https://yandex.ru/pogoda/search?request=` + addCity;
    URL = encodeURI(URL);
    let res = request('GET', URL, {});
    let $ = cheerio.load(res.body);
    let file = $("body > div > div.content.content_ancient-design_yes > div.grid.clearfix > div > div.grid__cell.grid__cell_pos_1.grid__cell_size_4 > div > li:nth-child(1) > a").text();
    file = file.split(",")[0];
    return file
}

module.exports = {
    getFullCityNameResolve:  getFullCityNameResolve
};