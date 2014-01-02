Http = require '../Http'
Request = require './Request'


original = Http.createRequest


Http.receive = (sendData = '', headers = {}, status = 200) ->
	Http.createRequest = (url, type, data, jsonp, jsonPrefix) ->
		request = new Request(url, type, data, jsonp, jsonPrefix)
		request.on 'afterSend', ->
			if typeof headers['content-type'] == 'undefined'
				headers['content-type'] = 'text/plain'

			for name, value of headers
				request.xhr.setResponseHeader(name, value)

			request.xhr.receive(status, sendData)

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