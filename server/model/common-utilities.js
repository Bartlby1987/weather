function logDataLoadingError(source, error) {
    console.error(`Error during getting information from ${source} provider:`, error.stack||error);
}
module.exports = {
    logDataLoadingError: logDataLoadingError
};