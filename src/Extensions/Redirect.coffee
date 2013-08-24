Http = require '../Http'

class Redirect


	constructor: ->
		Http.addExtension 'redirect',
			success: @onSuccess


	onSuccess: (response, request) ->
		if typeof response.data.redirect != 'undefined'
			window.location.href = response.data.redirect


module.exports = Redirect