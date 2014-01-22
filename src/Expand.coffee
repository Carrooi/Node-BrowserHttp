window.http = require './Http'

window.http.Helpers = require './Helpers'
window.http.Xhr = require './Xhr'
window.http._Q = require 'q'

window.http.Extensions =
	Forms: require './Extensions/Forms'
	Links: require './Extensions/Links'
	Loading: require './Extensions/Loading'
	Redirect: require './Extensions/Redirect'
	Snippets: require './Extensions/Snippets'

window.http.Mocks =
	Http: require './Mocks/Http'