Request = require './Request'

class Http


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


module.exports = Http