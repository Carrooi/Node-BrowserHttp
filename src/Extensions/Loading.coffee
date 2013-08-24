Http = require '../Http'

class Loading


	constructor: ->
		Http.addExtension 'loading',
			send: @onSend
			complete: @onComplete


	onSend: (response, request) =>
		document.body.style.cursor = 'progress'


	onComplete: (response, request) =>
		document.body.style.cursor = 'auto'


module.exports = Loading