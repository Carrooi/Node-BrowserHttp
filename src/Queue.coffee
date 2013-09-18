class Queue


	requests: null

	running: false


	constructor: ->
		@requests = []


	add: (request, fn) ->
		@requests.push(
			request: request
			fn: fn
		)


	run: ->
		if @running == false && @requests.length > 0
			@running = true

			data = @requests.shift()
			data.fn()

	next: ->
		@running = false
		@run()


module.exports = Queue