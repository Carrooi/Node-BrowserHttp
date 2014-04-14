$ = null

class Snippets


	constructor: (jQuery) ->
		$ = jQuery


	success: (response, request) =>
		if typeof response.data.snippets != 'undefined'
			for id, html of response.data.snippets
				@updateSnippet(id, html)


	updateSnippet: (id, html) ->
		el = $("##{id}")
		el.html(html)


module.exports = Snippets