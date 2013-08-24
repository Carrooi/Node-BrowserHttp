Http = require '../Http'
try jquery = require 'jquery' catch e then jquery = window.jQuery

class Links


	constructor: ->
		#historyApi = Http.isHistoryApiSupported()
		historyApi = false		# @todo

		jquery(document).on('click', 'a.ajax:not(.not-ajax)', (e) ->
			e.preventDefault()

			a = if e.target.nodeName.toLowerCase() == 'a' then jquery(e.target) else jquery(e.target).closest('a')
			link = a.attr('href')

			if historyApi then window.history.pushState({}, null, link)
			Http.get(link)
		)


module.exports = Links