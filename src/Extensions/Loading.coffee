BaseExtension = require './BaseExtension'


class Loading extends BaseExtension


	send: ->
		document.body.style.cursor = 'progress'


	complete: ->
		document.body.style.cursor = 'auto'


module.exports = Loading