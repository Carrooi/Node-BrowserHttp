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


	# From http://www.navioo.com/javascript/tutorials/Javascript_urlencode_1542.html
	@urlencode: (param) ->
		histogram = {}
		ret = param.toString()

		replacer = (search, replace, str) ->
			tmp_arr = str.split(search)
			return tmp_arr.join(replace)

		histogram["'"] = '%27'
		histogram['('] = '%28'
		histogram[')'] = '%29'
		histogram['*'] = '%2A'
		histogram['~'] = '%7E'
		histogram['!'] = '%21'
		histogram['%20'] = '+'

		ret = encodeURIComponent(ret)

		for search, replace of histogram
			ret = replacer(search, replace, ret)

		ret = ret.replace(/(\%([a-z0-9]{2}))/g, (full, m1, m2) ->
			return '%' + m2.toUpperCase()
		)

		return ret


	# From http://www.navioo.com/javascript/tutorials/Javascript_http_build_query_1537.html
	@buildQuery: (params) ->
		result = []

		for key, value of params
			key = @urlencode(key)
			value = @urlencode(value.toString())

			result.push("#{key}=#{value}")

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