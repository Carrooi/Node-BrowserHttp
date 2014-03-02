Http = require '../Http'
Request = require './Request'


original = Http.createRequest

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


Http.receive = (sendData = '', headers = {}, status = 200, timeout = null) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		return createRequest(url, type, data, jsonp, jsonPrefix, sendData, headers, status, timeout)


Http.receiveDataFromRequestAndSendBack = (headers = {}, status = 200, timeout = null) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		return createRequest(url, type, data, jsonp, jsonPrefix, data, headers, status, timeout)


Http.receiveError = (err) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		request = new Request(url, type, data, jsonp, jsonPrefix)

		request.on 'afterSend', ->
			request.xhr.receiveError(err)

		return request


Http.restore = ->
	Http.createRequest = original


module.exports = Http