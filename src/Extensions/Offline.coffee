BaseExtension = require './BaseExtension'


class Offline extends BaseExtension


	timer: null

	offline: false


	constructor: (url = 'favicon.ico', timeout = 5000) ->
		@start(url, timeout)


	start: (url = 'favicon.ico', timeout = 5000) ->
		@timer = window.setInterval( =>
			if @http == null
				throw new Error 'Please add Offline extension into http object with addExtension method.'

			@http.get(url, data: {r: Math.floor(Math.random() * 1000000000)}).then( (response) =>
				if (response.status >= 200 && response.status <= 300) || response.status == 304
					if @offline
						@offline = false
						@http.emit 'connected'

				else if !@offline
					@offline = true
					@http.emit 'disconnected'
			).fail( =>
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