Request = require './Request'
Queue = require './Queue'
Q = require 'q'
BaseExtension = require './Extensions/BaseExtension'
EventEmitter = require('events').EventEmitter

class Http extends EventEmitter


	extensions: null

	queue: null

	historyApiSupported: null

	useQueue: true

	options:
		type: 'GET'
		jsonPrefix: null
		parallel: true


	constructor: ->
		super

		@extensions = {}
		@queue = new Queue

		@on 'send', (args...) => @callExtensions('send', args)
		@on 'afterSend', (args...) => @callExtensions('afterSend', args)
		@on 'complete', (args...) => @callExtensions('complete', args)
		@on 'error', (args...) => @callExtensions('error', args)
		@on 'success', (args...) => @callExtensions('success', args)


	createRequest: (url, type, data, jsonp, jsonPrefix) ->
		return new Request(url, type, data, jsonp, jsonPrefix)


	request: (url, options = {}) ->
		if typeof options.type == 'undefined' then options.type = @options.type
		if typeof options.data == 'undefined' then options.data = null
		if typeof options.jsonp == 'undefined' then options.jsonp = false
		if typeof options.jsonPrefix == 'undefined' then options.jsonPrefix = @options.jsonPrefix
		if typeof options.parallel == 'undefined' then options.parallel = @options.parallel

		request = @createRequest(url, options.type, options.data, options.jsonp, options.jsonPrefix)

		request.on 'send', (response, request) => @emit 'send', response, request
		request.on 'afterSend', (response, request) => @emit 'afterSend', response, request
		request.on 'success', (response, request) => @emit 'success', response, request
		request.on 'error', (error, response, request) => @emit 'error', error, response, request
		request.on 'complete', (err, response, request) => @emit 'complete', err, response, request

		if @useQueue && (options.type in ['PUT', 'POST', 'DELETE'] || options.parallel == false || @queue.hasWritableRequests())
			return @queue.addAndSend(request)
		else
			return request.send()


	get: (url, options = {}) ->
		options.type = 'GET'
		return @request(url, options)


	post: (url, options = {}) ->
		options.type = 'POST'
		return @request(url, options)


	put: (url, options = {}) ->
		options.type = 'PUT'
		return @request(url, options)


	delete: (url, options = {}) ->
		options.type = 'DELETE'
		return @request(url, options)


	getJson: (url, options = {}) ->
		return @request(url, options).then( (response) ->
			if typeof response.data == 'string'
				response.data = JSON.parse(response.data)
			return Q.resolve(response)
		)


	postJson: (url, options = {}) ->
		options.type = 'POST'
		return @request(url, options).then( (response) ->
			if typeof response.data == 'string'
				response.data = JSON.parse(response.data)
			return Q.resolve(response)
		)


	jsonp: (url, options = {}) ->
		if typeof options.jsonp == 'undefined' then options.jsonp = true
		return @get(url, options)


	isHistoryApiSupported: ->
		if @historyApiSupported
			@historyApiSupported = window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)

		return @historyApiSupported


	addExtension: (name, extension) ->
		if extension instanceof BaseExtension
			extension.setHttp(@)

		@extensions[name] = extension
		return @


	removeExtension: (name) ->
		if typeof @extensions[name] == 'undefined'
			throw new Error 'Extension ' + name + ' does not exists'

		delete @extensions[name]
		return @


	callExtensions: (event, args) ->
		for name, ext of @extensions
			if typeof ext[event] != 'undefined' then ext[event].apply(ext[event], args)


module.exports = Http
