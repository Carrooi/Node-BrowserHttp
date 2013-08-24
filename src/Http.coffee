Request = require './Request'
Q = require 'q'

class Http


	@events:
		send: []
		complete: []
		error: []
		success: []

	@extensions: {}


	@request: (url, options = {}) ->
		if !options.type then options.type = 'GET'
		if !options.data then options.data = {}

		return (new Request(url, options.type, options.data)).send()


	@get: (url, options = {}) ->
		options.type = 'GET'
		return @request(url, options)


	@post: (url, options = {}) ->
		options.type = 'POST'
		return @request(url, options)


	@put: (url, options = {}) ->
		options.type = 'PUT'
		return @request(url, options)


	@delete: (url, options = {}) ->
		options.type = 'DELETE'
		return @request(url, options)


	@getJson: (url, options = {}) ->
		return @request(url, options).then( (response) ->
			if typeof response.data == 'string'
				response.data = JSON.parse(response.data)
			return Q.resolve(response)
		)


	@postJson: (url, options = {}) ->
		options.type = 'POST'
		return @request(url, options).then( (response) ->
			if typeof response.data == 'string'
				response.data = JSON.parse(response.data)
			return Q.resolve(response)
		)


	@urlencode: (param) ->
		param = (param + '').toString()

		return encodeURIComponent(param)
			.replace(/!/g, '%21')
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\*/g, '%2A')
			.replace(/\~/g, '%7E')
			.replace(/%20/g, '+')


	# From jQuery
	@buildQuery: (params) ->
		result = []

		add = (key, value) ->
			value = if typeof value == 'function' then value() else (if value == null then '' else value)
			result.push encodeURIComponent(key) + '=' + encodeURIComponent(value)

		buildParams = (key, value) ->
			if Object.prototype.toString.call(value) == '[object Array]'
				for v, i in value
					if /\[\]$/.test(key) == true
						add(key, v)
					else
						buildParams(key + '[' + (if typeof v == 'object' then i else '') + ']', v)

			else if Object.prototype.toString.call(value) == '[object Object]'
				for k, v of value
					buildParams(key + '[' + k + ']', v)

			else
				add(key, value)

		if Object.prototype.toString.call(params) == '[object Array]'
			for value, key in params
				add(key, value)

		else
			for key, value of params
				buildParams(key, value)

		return result.join('&').replace(/%20/g, '+')







		helper = (key, val) =>
			tmp = []

			if val == true then val = '1'
			else if val == false then val = '0'

			if val != null && typeof val == 'object'
				if Object.prototype.toString.call(val) == '[object Object]'
					for k, v of val
						if v != null
							tmp.push helper("#{key}[#{k}]", v)
				else
					for v, k in val
						if v != null
							passKey = if typeof v == 'object' then k else ''
							tmp.push helper("#{key}[#{passKey}]", v)

				return tmp.join('&')
			else if typeof val != 'function'
				return @urlencode(key) + '=' + @urlencode(val)
			else if typeof val == 'function'
				return ''
			else
				throw new Error 'There was an error processing for http_build_query()'

		result = []
		for key, value of params
			result.push helper(key, value)

		return result.join('&')


	@isHistoryApiSupported: ->
		return window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)


	@addExtension: (name, fns) ->
		@extensions[name] = fns
		return @


	@removeExtension: (name) ->
		if typeof @extensions[name] == 'undefined'
			throw new Error 'Extension ' + name + ' does not exists'

		delete @extensions[name]
		return @


	@onSend: (fn) -> @events.send.push(fn)

	@onComplete: (fn) -> @events.complete.push(fn)

	@onError: (fn) -> @events.error.push(fn)

	@onSuccess: (fn) -> @events.success.push(fn)


module.exports = Http