Http = require '../Http'

$ = null

class Links


	constructor: (jQuery) ->
		$ = jQuery

		#historyApi = Http.isHistoryApiSupported()
		historyApi = false		# @todo

		$(document).on('click', 'a.ajax:not(.not-ajax)', (e) ->
			e.preventDefault()

			a = if e.target.nodeName.toLowerCase() == 'a' then $(e.target) else $(e.target).closest('a')
			link = a.attr('href')

			if historyApi then window.history.pushState({}, null, link)
			Http.get(link)
		)


module.exports = Links