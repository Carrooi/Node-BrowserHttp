class Helpers


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


module.exports = Helpers