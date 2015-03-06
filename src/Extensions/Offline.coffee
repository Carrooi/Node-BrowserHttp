BaseExtension = require './BaseExtension'


class Offline extends BaseExtension


	@HTTP_TYPE = 'HEAD'


	timer: null

	offline: false


	constructor: (url = 'favicon.ico', timeout = 5000) ->
		@start(url, timeout)


	start: (url = 'favicon.ico', timeout = 5000) ->
		@timer = window.setInterval( =>
			if @http == null
				throw new Error 'Please add Offline extension into http object with addExtension method.'

			options =
				type: Offline.HTTP_TYPE
				data:
					r: Math.floor(Math.random() * 1000000000)

			@http.request(url, options).then( (response) =>
				if (response.status >= 200 && response.status <= 300) || response.status == 304
					if @offline
						@offline = false
						@http.emit 'connected'

				else if !@offline
					@offline = true
					@http.emit 'disconnected'
			).catch( =>
				if !@offline
					@offline = true
					@http.emit 'disconnected'
			)
		, timeout)


	stop: ->
		if @timer != null
			window.clearInterval(@timer)
			@timer = null

		return @



module.exports = Offline
