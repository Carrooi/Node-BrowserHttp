OriginalRequest = require '../Request'
Xhr = require './Xhr'

class Request extends OriginalRequest


	createXhr: (url, type, data, jsonp, jsonPrefix) ->
		return new Xhr(url, type, data, jsonp, jsonPrefix)


module.exports = Request