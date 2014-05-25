class Snippets


	success: (response, request) =>
		if typeof response.data.snippets != 'undefined'
			for id, html of response.data.snippets
				@updateSnippet(id, html)


	updateSnippet: (id, html) ->
		document.getElementById(id).innerHTML = html


module.exports = Snippets