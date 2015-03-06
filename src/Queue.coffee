EventEmitter = require('events').EventEmitter
Q = require 'q'

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


	addAndSend: (request) ->
		@emit 'add', request

		deferred = Q.defer()

		@requests.push(
			request: request
			fn: (err, response) ->
				if err then deferred.reject(err) else deferred.resolve(response)
		)

		if !@running
			@run()

		return deferred.promise


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

		request.send().then( (response) =>
			fn(null, response)
			@next()
		).catch( (err) =>
			fn(err, null)
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
