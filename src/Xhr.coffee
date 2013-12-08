Helpers = require './Helpers'
Response = require './Response'
EventEmitter = require('events').EventEmitter
Q = require 'q'

class Xhr extends EventEmitter


	@JSONP_METHOD_PREFIX = '__browser_http_jsonp_callback_'

	@COUNTER = 0


	xhr: null

	response: null


	url: null

	type: 'GET'

	data: null

	jsonp: false


	constructor: (@url, @type = 'GET', @data = null, @jsonp = false) ->
		@response = new Response

		Xhr.COUNTER++

		@type = @type.toUpperCase()

		if @type not in ['GET', 'POST', 'PUT', 'DELETE']
			throw new Error "Http request: type must be GET, POST, PUT or DELETE, #{@type} given"

		if @jsonp != false
			if @jsonp == true
				@jsonp = 'callback'

			method = Xhr.JSONP_METHOD_PREFIX + Xhr.COUNTER

			@url += if @url.indexOf('?') != -1 then '&' else '?'
			@url += @jsonp + '=' + method

			window[method] = (data) => @response.data = data

		if @data != null
			@data = Helpers.buildQuery(@data)
			if type != 'POST'
				@url += if @url.indexOf('?') != -1 then '&' else '?'
				@url += @data

		@xhr = @createXhr()
		@xhr.open(@type, @url, true)

		if @url.match(/^(http)s?\:\/\//) == null
			@xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

		if @type == 'POST'
			@xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

		@xhr.onreadystatechange = =>
			@response.state = @xhr.readyState

			if @response.state == 4
				@response.status = @xhr.status
				@response.statusText = @xhr.statusText

				@response.rawData = @xhr.responseText
				@response.xml = @xhr.responseXML
				@response.data = @xhr.responseText

				contentType = @xhr.getResponseHeader('content-type')
				if contentType != null && contentType.match(/application\/json/) != null
					@response.data = JSON.parse(@response.data)


				if contentType != null && (contentType.match(/text\/javascript/) != null || contentType.match(/application\/javascript/) != null) && @jsonp
					eval(@response.data)

				if @response.status == 200
					@emit 'success', @
				else
					@emit 'error', new Error "Can not load #{url} address", @


	createXhr: ->
		if window.XMLHttpRequest
			return new window.XMLHttpRequest
		else
			return new ActiveXObject("Microsoft.XMLHTTP")


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


	send: ->
		deferred = Q.defer()

		@emit 'send', @response

		@on 'success', => deferred.resolve(@response)
		@on 'error', (err) -> deferred.reject(err)

		@xhr.send(@data)

		@emit 'afterSend', @response

		return deferred.promise


	abort: ->
		@xhr.abort()
		return @


module.exports = Xhr