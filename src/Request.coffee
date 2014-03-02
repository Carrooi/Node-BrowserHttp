Xhr = require './Xhr'
EventEmitter = require('events').EventEmitter

class Request extends EventEmitter


	url: null

	type: 'GET'

	data: null

	jsonp: null

	xhr: null

	response: null

	jsonPrefix: null


	constructor: (@url, @type = 'GET', @data = null, @jsonp = false, @jsonPrefix = null) ->
		super

		@xhr = @createXhr(@url, @type, @data, @jsonp, @jsonPrefix)

		@response = @xhr.response

		@xhr.on 'send', (response) => @emit 'send', response, @
		@xhr.on 'afterSend', (response) => @emit 'afterSend', response, @
		@xhr.on 'success', (response) => @emit 'success', response, @
		@xhr.on 'error', (err, response) => @emit 'error', err, response, @
		@xhr.on 'complete', (err, response) => @emit 'complete', err, response, @


	createXhr: (url, type, data, jsonp, jsonPrefix) ->
		return new Xhr(url, type, data, jsonp, jsonPrefix)


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