Request = require './Request'

OriginalHttp = require '../_Http'


createRequest = (requestUrl, requestType, requestData, requestJsonp, requestJsonPrefix, responseData, responseHeaders = {}, responseStatus = 200, responseTimeout = null) ->
	if typeof responseHeaders['content-type'] == 'undefined' then responseHeaders['content-type'] = 'text/plain'

	if (responseHeaders['content-type'].match(/application\/json/) != null || @jsonPrefix != null) && Object.prototype.toString.call(responseData) in ['[object Array]', '[object Object]']
		responseData = JSON.stringify(responseData)

	request = new Request(requestUrl, requestType, requestData, requestJsonp, requestJsonPrefix)

	request.on 'afterSend', ->
		for name, value of responseHeaders
			request.xhr.setResponseHeader(name, value)

		request.xhr.receive(responseStatus, responseData, responseTimeout)

	return request


class Http extends OriginalHttp


	_originalCreateRequest: null


	constructor: ->
		super

		@_originalCreateRequest = @createRequest


	receive: (sendData = '', headers = {}, status = 200, timeout = null) ->
		@createRequest = (url, type, data, jsonp, jsonPrefix) ->
			return createRequest(url, type, data, jsonp, jsonPrefix, sendData, headers, status, timeout)


	receiveDataFromRequestAndSendBack: (headers = {}, status = 200, timeout = null) ->
		@createRequest = (url, type, data, jsonp, jsonPrefix) ->
			return createRequest(url, type, data, jsonp, jsonPrefix, data, headers, status, timeout)


	receiveError: (err) ->
		@createRequest = (url, type, data, jsonp, jsonPrefix) ->
			request = new Request(url, type, data, jsonp, jsonPrefix)

			request.on 'afterSend', ->
				request.xhr.receiveError(err)

			return request


	restore: ->
		@createRequest = @_originalCreateRequest


module.exports = Http