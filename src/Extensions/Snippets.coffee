hasAttr = (el, name) ->
	attr = el.getAttribute(name)
	return typeof attr != 'undefined' && attr != false


class Snippets


	@APPEND_ATTRIBUTE = 'data-append'


	success: (response, request) =>
		if typeof response.data.snippets != 'undefined'
			for id, html of response.data.snippets
				el = document.getElementById(id)

				if hasAttr(el, Snippets.APPEND_ATTRIBUTE)
					@appendSnippet(el, html)
				else
					@updateSnippet(el, html)


	updateSnippet: (el, html) ->
		el.innerHTML = html


	appendSnippet: (el, html) ->
		el.innerHTML += html


module.exports = Snippets