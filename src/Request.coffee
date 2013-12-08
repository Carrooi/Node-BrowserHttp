Xhr = require './Xhr'
EventEmitter = require('events').EventEmitter

class Request extends EventEmitter


	url: null

	type: 'GET'

	data: null

	jsonp: null

	xhr: null

	response: null


	constructor: (@url, @type = 'GET', @data = null, @jsonp = false) ->
		super

		@xhr = new Xhr(@url, @type, @data, @jsonp)

		@response = @xhr.response

		@xhr.on 'send', => @emit 'send', @response, @

		@xhr.on 'success', =>
			@emit 'success', @response, @
			@emit 'complete', @response, @

		@xhr.on 'error', (err) =>
			@emit 'error', err, @response, @
			@emit 'complete', @response, @


	setHeader: (name, value) ->
		return @xhr.setHeader(name, value)


	send: ->
		return @xhr.send()


	abort: ->
		return @xhr.abort()


	getHeaders: ->
		return @xhr.getHeaders()


	getHeader: (name) ->
		return @xhr.getHeader(name)


	setHeader: (name, value) ->
		return @xhr.setHeader(name, value)


	setMimeType: (mime) ->
		return @xhr.setMimeType(mime)


module.exports = Request