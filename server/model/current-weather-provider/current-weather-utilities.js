function transformStringInObject(string, page) {
    let dateObject = {};
    let stringArray = string.split("\n");
    let town = stringArray[0];
    dateObject[town] = encodeURI(page + town);
    return dateObject
}

module.exports = {
    transformStringInObject: transformStringInObject
};