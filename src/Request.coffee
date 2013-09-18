Q = require 'q'
Response = require './Response'
Helpers = require './Helpers'
EventEmitter = require('events').EventEmitter

class Request extends EventEmitter


	@JSONP_METHOD_PREFIX = '__browser_http_jsonp_callback_'


	id: null

	url: null

	type: 'GET'

	jsonp: null

	data: null

	_data: null

	xhr: null

	response: null


	constructor: (@url, @type = 'GET', @data = null, @jsonp = false, @id) ->
		super

		url = @url

		@type = @type.toUpperCase()
		if @type not in ['GET', 'POST', 'PUT', 'DELETE']
			throw new Error 'Http request: type must be GET, POST, PUT or DELETE, ' + @type + ' given'

		if @jsonp != false
			if @jsonp == true then @jsonp = 'callback'
			method = Request.JSONP_METHOD_PREFIX + @id

			url += if url.indexOf('?') != -1 then '&' else '?'
			url += @jsonp + '=' + method

			window[method] = (data) => @response.data = data

		if @data != null
			@_data = Helpers.buildQuery(@data)
			if @type != 'POST'
				url += if url.indexOf('?') != -1 then '&' else '?'
				url += @_data

		@xhr = Request.createRequestObject()
		@xhr.open(@type, url, true)

		if url.match(/^(http)s?\:\/\//) == null
			@setHeader('X-Requested-With', 'XMLHttpRequest')

		if @type == 'POST'
			@setHeader('Content-type', 'application/x-www-form-urlencoded')

		@response = new Response
		@xhr.onreadystatechange = =>
			@response.state = @xhr.readyState

			if @response.state == 4
				@response.status = @xhr.status
				@response.statusText = @xhr.statusText

				@response.rawData = @xhr.responseText
				@response.xml = @xhr.responseXML
				@response.data = @xhr.responseText

				contentType = @getHeader 'content-type'
				if contentType != null && contentType.match(/application\/json/) != null
					@response.data = JSON.parse(@response.data)

				if contentType != null && contentType.match(/text\/javascript/) != null && @jsonp
					eval(@response.data)

				if @response.status == 200
					@emit 'success', @response, @
				else
					error = new Error 'Can not load ' + url + ' address'
					@emit 'error', error, @response, @

				@emit 'complete', @response, @


	setHeader: (name, value) ->
		@xhr.setRequestHeader(name, value)
		return @


	send: ->
		deferred = Q.defer()

		@emit 'send', @response, @

		@on 'success', (response) -> deferred.resolve(response)
		@on 'error', (error) -> deferred.reject(error)

		@xhr.send(@_data)

		return deferred.promise


	abort: ->
		@xhr.abort()
		return @


	getHeaders: ->
		return @xhr.getAllResponseHeaders()


	getHeader: (name) ->
		return @xhr.getResponseHeader(name)


	setHeader: (name, value) ->
		@xhr.setRequestHeader(name, value)
		return @


	setMimeType: (mime) ->
		@xhr.overrideMimeType(mime)
		return @


	@createRequestObject: ->
		if window.XMLHttpRequest
			return new window.XMLHttpRequest
		else
			return new ActiveXObject("Microsoft.XMLHTTP")


module.exports = Request