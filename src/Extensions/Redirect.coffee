BaseExtension = require './BaseExtension'


class Redirect extends BaseExtension


	success: (response) ->
		if typeof response.data.redirect != 'undefined'
			window.location.href = response.data.redirect


module.exports = Redirect
