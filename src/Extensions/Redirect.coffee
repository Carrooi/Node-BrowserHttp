class Redirect


	success: (response, request) ->
		if typeof response.data.redirect != 'undefined'
			window.location.href = response.data.redirect


module.exports = Redirect