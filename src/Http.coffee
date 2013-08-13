Request = require './Request'
Q = require 'q'

class Http


	@events:
		send: []
		complete: []
		error: []
		success: []

	@extensions: {}


	@request: (url, options = {}) ->
		if !options.type then options.type = 'GET'
		if !options.data then options.data = {}

		return (new Request(url, options.type, options.data)).send()


	@get: (url, options = {}) ->
		options.type = 'GET'
		return @request(url, options)


	@post: (url, options = {}) ->
		options.type = 'POST'
		return @request(url, options)


	@put: (url, options = {}) ->
		options.type = 'PUT'
		return @request(url, options)


	@delete: (url, options = {}) ->
		options.type = 'DELETE'
		return @request(url, options)


	@getJson: (url, options = {}) ->
		return @request(url, options).then( (response) ->
			response.data = JSON.parse(response.data)
			return Q.resolve(response)
		)


	@postJson: (url, options = {}) ->
		options.type = 'POST'
		return @request(url, options).then( (response) ->
			response.data = JSON.parse(response.data)
			return Q.resolve(response)
		)


	@addExtension: (name, fns) ->
		@extensions[name] = fns
		return @


	@removeExtension: (name) ->
		if typeof @extensions[name] == 'undefined'
			throw new Error 'Extension ' + name + ' does not exists'

		delete @extensions[name]
		return @


	@onSend: (fn) -> @events.send.push(fn)

	@onComplete: (fn) -> @events.complete.push(fn)

	@onError: (fn) -> @events.error.push(fn)

	@onSuccess: (fn) -> @events.success.push(fn)


module.exports = Http