$ = null


hasAttr = (el, name) ->
	attr = $(el).attr(name)
	return typeof attr != 'undefined' && attr != false


class Links


	@HISTORY_API_ATTRIBUTE = 'data-history-api'


	http: null


	constructor: (jQuery) ->
		$ = jQuery

		historyApi = Http.isHistoryApiSupported()

		$(document).on('click', 'a.ajax:not(.not-ajax)', (e) =>
			e.preventDefault()

			a = if e.target.nodeName.toLowerCase() == 'a' then $(e.target) else $(e.target).closest('a')
			link = a.attr('href')

			if historyApi && hasAttr(a, Links.HISTORY_API_ATTRIBUTE)
				window.history.pushState({}, null, link)

			if @http == null
				throw new Error 'Please add Links extension into http object with addExtension method.'

			@http.get(link)
		)


module.exports = Links