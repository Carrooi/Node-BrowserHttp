Q = require 'q'
Response = require './Response'

class Request


	@Http: null


	url: null

	type: 'GET'

	data: null

	xhr: null

	response: null


	complete: null

	success: null

	error: null


	constructor: (@url, @type = 'GET', @data = null) ->
		url = @url
		@type = @type.toUpperCase()
		if @type not in ['GET', 'POST', 'PUT', 'DELETE']
			throw new Error 'Http request: type must be GET, POST, PUT or DELETE, ' + @type + ' given'

		if @data != null
			data = Request.getHttp().buildQuery(@data)
			if @type != 'POST'
				url = if @url.indexOf('?') != -1 then @url + '&' + data else @url + '?' + data

		@xhr = Request.createRequestObject()
		@xhr.open(@type, url, true)

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

				if @getHeader('content-type').match(/application\/json/) != null
					@response.data = JSON.stringify(@response.data)

				if @response.status == 200
					if @success != null then @success(@response)
					Request.callHttpEvent(@response, @, 'success')
				else
					error = new Error 'Can not load ' + url + ' address'
					if @error != null then @error(error)
					Request.callHttpEvent(@response, @, 'error', [error])

				if @complete != null then @complete(@response)
				Request.callHttpEvent(@response, @, 'complete')



	setHeader: (name, value) ->
		@xhr.setRequestHeader(name, value)
		return @


	send: ->
		deferred = Q.defer()

		Request.callHttpEvent(@response, @, 'send')

		@complete = (response) -> deferred.resolve(response)
		@success = (response) -> deferred.resolve(response)
		@error = (e) => deferred.reject(e)

		@xhr.send(@data)

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


	@getHttp: ->
		if @Http == null then @Http = require './Http'
		return @Http


	@callHttpEvent: (response, request, event, args = []) ->
		@getHttp()

		args.push(response)
		args.push(request)

		fn.apply(response, args) for fn in @Http.events[event]
		for name, ext of @Http.extensions
			if typeof ext[event] != 'undefined' then ext[event].apply(response, args)


module.exports = Request