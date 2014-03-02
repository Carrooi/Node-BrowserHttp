Http = require '../Http'
Request = require './Request'
Helpers = require '../Helpers'


original = Http.createRequest

createRequest = (requestUrl, requestType, requestData, requestJsonp, requestJsonPrefix, responseData, responseHeaders = {}, responseStatus = 200) ->
	if typeof responseHeaders['content-type'] == 'undefined' then responseHeaders['content-type'] = 'text/plain'

	request = new Request(requestUrl, requestType, requestData, requestJsonp, requestJsonPrefix)

	request.on 'afterSend', ->
		for name, value of responseHeaders
			request.xhr.setResponseHeader(name, value)

		request.xhr.receive(responseStatus, responseData)

	return request


Http.receive = (sendData = '', headers = {}, status = 200) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		return createRequest(url, type, data, jsonp, jsonPrefix, sendData, headers, status)


Http.receiveDataFromRequestAndSendBack = (headers = {}, status = 200) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		return createRequest(url, type, data, jsonp, jsonPrefix, data, headers, status)


Http.receiveError = (err) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		request = new Request(url, type, data, jsonp, jsonPrefix)

		request.on 'afterSend', ->
			request.xhr.receiveError(err)

		return request


Http.restore = ->
	Http.createRequest = original


module.exports = Http