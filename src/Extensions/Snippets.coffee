BaseExtension = require './BaseExtension'


hasAttr = (el, name) ->
	attr = el.getAttribute(name)
	return attr != null && typeof attr != 'undefined' && attr != false


class Snippets extends BaseExtension


	@APPEND_ATTRIBUTE = 'data-append'


	success: (response) =>
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