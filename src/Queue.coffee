EventEmitter = require('events').EventEmitter

class Queue extends EventEmitter


	requests: null

	running: false


	constructor: ->
		@requests = []


	hasWritableRequests: ->
		if @running
			for request in @requests when request.request.type in ['PUT', 'POST', 'DELETE']
				return true

		return false


	getCurrentRequest: ->
		if @requests.length == 0
			return null

		return @requests[0].request


	addAndSend: (request, fn) ->
		@emit 'add', request

		@requests.push(
			request: request
			fn: fn
		)

		if !@running
			@run()

		return @


	next: ->
		@requests.shift()

		if @requests.length > 0
			@emit 'next', @requests[0].request
			@run()
		else
			@running = false
			@emit 'finish'


	run: ->
		if @requests.length == 0
			throw new Error 'No pending requests'

		@running = true

		data = @requests[0]
		request = data.request
		fn = data.fn

		@emit 'send', request

		request.send( (response, err) =>
			fn(response, err)
			@next()
		)


	removePending: ->
		if @running
			request = @requests[0]
			@requests = [request]
		else
			@requests = []

		return @


	stop: ->
		if @running
			@getCurrentRequest().abort()

		@requests = []

		return @


module.exports = Queue
