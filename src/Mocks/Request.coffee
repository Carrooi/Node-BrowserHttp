OriginalRequest = require '../Request'
Xhr = require './Xhr'

class Request extends OriginalRequest


	createXhr: (url, type, data, jsonp) ->
		return new Xhr(url, type, data, jsonp)


module.exports = Request