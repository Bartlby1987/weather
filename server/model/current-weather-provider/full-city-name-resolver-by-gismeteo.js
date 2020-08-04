const cheerio = require('cheerio');
const request = require('sync-request');

function getFullCityNameResolveByGismeteo(addCity) {
    URL ='https://www.gismeteo.ru/search/'+addCity;
    URL = encodeURI(URL);
    let res = request('GET', URL, {});
    let $ = cheerio.load(res.body);
    // let cityNameFromGismeteoPage =$(body > section > div.content_wrap.countries > div > section:nth-child(3) > div > div:nth-child(1) > a.catalog_link.link.blue.fontM).text();
    let cityNameFromGismeteoPage =$("body > section > div.content_wrap.countries > div > section > div > div > div:nth-child(1) > a.catalog_link.link.blue.fontM ").text();
    return cityNameFromGismeteoPage
}

// console.log(getFullCityNameResolveByGismeteo("чtляба"));
// console.log(getFullCityNameResolveByGismeteo("Москва"));

module.exports = {
    getFullCityNameResolveByGismeteo:  getFullCityNameResolveByGismeteo
};