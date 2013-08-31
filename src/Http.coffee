Request = require './Request'
Q = require 'q'
EventEmitter = require('events').EventEmitter

class Http extends EventEmitter


	extensions: {}


	constructor: ->
		super

		@on 'send', (args...) => @callExtensions('send', args)
		@on 'complete', (args...) => @callExtensions('complete', args)
		@on 'error', (args...) => @callExtensions('error', args)
		@on 'success', (args...) => @callExtensions('success', args)


	request: (url, options = {}) ->
		if !options.type then options.type = 'GET'
		if !options.data then options.data = null

		request = new Request(url, options.type, options.data)

		request.on 'send', (response, request) => @emit 'send', response, request
		request.on 'success', (response, request) => @emit 'success', response, request
		request.on 'error', (error, response, request) => @emit 'error', response, request
		request.on 'complete', (response, request) => @emit 'complete', response, request

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


	isHistoryApiSupported: ->
		return window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)


	addExtension: (name, fns) ->
		@extensions[name] = fns
		return @


	removeExtension: (name) ->
		if typeof @extensions[name] == 'undefined'
			throw new Error 'Extension ' + name + ' does not exists'

		delete @extensions[name]
		return @


	callExtensions: (event, args) ->
		for name, ext of @extensions
			if typeof ext[event] != 'undefined' then ext[event].apply(ext[event], args)


module.exports = new Http