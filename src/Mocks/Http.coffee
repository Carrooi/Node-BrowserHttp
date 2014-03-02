Http = require '../Http'
Request = require './Request'
Helpers = require '../Helpers'


original = Http.createRequest


Http.receive = (sendData = '', headers = {}, status = 200) ->
	if typeof headers['content-type'] == 'undefined' then headers['content-type'] = 'text/plain'

	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		request = new Request(url, type, data, jsonp, jsonPrefix)

		request.on 'afterSend', ->
			for name, value of headers
				request.xhr.setResponseHeader(name, value)

			request.xhr.receive(status, sendData)

		return request


Http.receiveDataFromRequestAndSendBack = (headers = {}, status = 200) ->
	if typeof headers['content-type'] == 'undefined' then headers['content-type'] = 'text/plain'

	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		request = new Request(url, type, data, jsonp, jsonPrefix)

		request.on 'afterSend', ->
			for name, value of headers
				request.xhr.setResponseHeader(name, value)

			request.xhr.receive(status, Helpers.buildQuery(data))

		return request


Http.receiveError = (err) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		request = new Request(url, type, data, jsonp, jsonPrefix)

		request.on 'afterSend', ->
			request.xhr.receiveError(err)

		return request


Http.restore = ->
	Http.createRequest = original


module.exports = Http