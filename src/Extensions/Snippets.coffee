Http = require '../Http'
try jquery = require 'jquery' catch e then jquery = window.jQuery

class Snippets


	_onRefresh: null


	constructor: ->
		@_onRefresh = []

		Http.addExtension 'snippets',
			success: @onSuccess


	onSuccess: (response, request) =>
		if typeof response.data.snippets != 'undefined'
			for id, html of response.data.snippets
				@updateSnippet(id, html)


	updateSnippet: (id, html) ->
		el = jquery("##{id}")
		el.html(html)
		for ev in @_onRefresh
			ev(el)


	onRefresh: (fn) ->
		@_onRefresh.push(fn)
		return @


module.exports = Snippets