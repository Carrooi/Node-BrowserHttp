EventEmitter = require('events').EventEmitter
Q = require 'q'

class Queue extends EventEmitter


	requests: null

	running: false


	constructor: ->
		@requests = []


	hasWritableRequests: ->
		if @running
			for request in @requests when request.type in ['PUT', 'POST', 'DELETE']
				return true

		return false


	addAndSend: (request) ->
		@emit 'add', request

		deferred = Q.defer()

		@requests.push(
			request: request
			fn: (err, response) ->
				if err then deferred.reject(err) else deferred.resolve(response)
		)

		@run()

		return deferred.promise


	run: ->
		if @requests.length == 0
			throw new Error 'No pending requests'

		data = @requests.shift()
		request = data.request
		fn = data.fn

		@emit 'send', request

		next = =>
			if @requests.length > 0
				@emit 'next'
				@run()

		request.send().then( (response) ->
			fn(null, response)
			next()
		).fail( (err) ->
			fn(err, null)
			next()
		)


module.exports = Queue