EventEmitter = require('events').EventEmitter

class BaseExtension extends EventEmitter


	http: null


	setHttp: (@http) ->
		@emit 'httpReady', @http


module.exports = BaseExtension