Http = require './_Http'


createInstance = ->
	http = new Http

	http.Helpers = require './Helpers'
	http.Xhr = require './Xhr'

	http.Extensions =
		Forms: require './Extensions/Forms'
		Links: require './Extensions/Links'
		Loading: require './Extensions/Loading'
		Redirect: require './Extensions/Redirect'
		Snippets: require './Extensions/Snippets'
		Offline: require './Extensions/Offline'

	http.Mocks =
		Http: require './Mocks/Http'


	return http


http = createInstance()
http.createInstance = createInstance


module.exports = http
