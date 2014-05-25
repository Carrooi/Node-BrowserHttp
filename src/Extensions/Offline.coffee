class Offline


	timer: null

	offline: false


	constructor: (url = 'favicon.ico', timeout = 5000) ->
		@start(url, timeout)


	start: (url = 'favicon.ico', timeout = 5000) ->
		@timer = window.setInterval( =>
			@http.get(url, data: {r: Math.floor(Math.random() * 1000000000)}).then( (response) =>
				if (response.status >= 200 && response.status <= 300) || response.status == 304
					if @offline
						@offline = false
						@http.emit 'connected'

				else if !@offline
					@offline = false
					@http.emit 'disconnected'
			)
		, timeout)


	stop: ->
		if @timer != null
			window.clearInterval(@timer)
			@timer = null

		return @



module.exports = Offline