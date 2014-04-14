$ = null

class Links


	http: null


	constructor: (jQuery) ->
		$ = jQuery

		#historyApi = Http.isHistoryApiSupported()
		historyApi = false		# @todo

		$(document).on('click', 'a.ajax:not(.not-ajax)', (e) =>
			e.preventDefault()

			a = if e.target.nodeName.toLowerCase() == 'a' then $(e.target) else $(e.target).closest('a')
			link = a.attr('href')

			if historyApi then window.history.pushState({}, null, link)

			if @http == null
				throw new Error 'Please add Links extension into http object with addExtension method.'

			@http.get(link)
		)


module.exports = Links