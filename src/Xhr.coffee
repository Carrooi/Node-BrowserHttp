Helpers = require './Helpers'
Response = require './Response'
EventEmitter = require('events').EventEmitter
Q = require 'q'
escape = require 'escape-regexp'

class Xhr extends EventEmitter


	@JSONP_METHOD_PREFIX = '__browser_http_jsonp_callback_'

	@COUNTER = 0


	xhr: null

	response: null


	url: null

	type: 'GET'

	data: null

	jsonp: false

	jsonPrefix: null


	constructor: (@url, @type = 'GET', @data = null, @jsonp = false, @jsonPrefix = null) ->
		@response = new Response

		Xhr.COUNTER++

		if @jsonp != false
			if @jsonp == true
				@jsonp = 'callback'

			method = Xhr.JSONP_METHOD_PREFIX + Xhr.COUNTER

			@url += if @url.indexOf('?') != -1 then '&' else '?'
			@url += @jsonp + '=' + method

			window[method] = (data) => @response.data = data

		if @data != null
			@data = Helpers.buildQuery(@data)
			if @type != 'POST'
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

			# with little help from jquery: https://github.com/jquery/jquery/blob/master/src/ajax.js#L694-L735
			if @response.state == 4
				@response.status = @xhr.status

				isSuccess = (@response.status >= 200 && @response.status < 300) || @response.status == 304

				if isSuccess
					if @response.status == 204 || @type == 'HEAD'
						@response.statusText = 'nocontent'

					else if @response.status == 304
						@response.statusText = 'notmodified'

					else
						@response.statusText = @xhr.statusText

						@response.rawData = @xhr.responseText
						@response.xml = @xhr.responseXML
						@response.data = @xhr.responseText

						contentType = @xhr.getResponseHeader('content-type')
						if contentType != null && (contentType.match(/application\/json/) != null || @jsonPrefix != null)
							data = @response.data
							if @jsonPrefix != null
								prefix = escape(@jsonPrefix)
								data = data.replace(new RegExp('^' + prefix), '')

							@response.data = JSON.parse(data)

						if contentType != null && (contentType.match(/text\/javascript/) != null || contentType.match(/application\/javascript/) != null) && @jsonp
							eval(@response.data)

					@emit 'success', @response

				else
					@response.statusText = @xhr.statusText

					error = new Error "Can not load #{@url} address"
					error.response = @response

					@emit 'error', error, @response


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

		@on 'success', (response) =>
			@emit 'complete', null, response
			deferred.resolve(response)

		@on 'error', (err, response) =>
			@emit 'complete', err, response
			deferred.reject(err)

		@xhr.send(@data)

		@emit 'afterSend', @response

		return deferred.promise


	abort: ->
		@xhr.abort()
		@emit 'abort', @response
		return @


module.exports = Xhr