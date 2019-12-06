module.exports = {
  logErrorResponses: (requestParams, response, context, ee, next) => {
    if (+response.statusCode == 404) {
      console.log(`${response.statusCode}: ${requestParams.url}`)
    }
    return next();
  }
}
