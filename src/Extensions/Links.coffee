BaseExtension = require './BaseExtension'


$ = null


hasAttr = (el, name) ->
	attr = $(el).attr(name)
	return typeof attr != 'undefined' && attr != false


class Links extends BaseExtension


	@HISTORY_API_ATTRIBUTE = 'data-history-api'

	@EVENT_NAMESPACE = 'http-ext-links'


	constructor: (jQuery) ->
		$ = jQuery

		$(document).on('click.' + Links.EVENT_NAMESPACE, 'a.ajax:not(.not-ajax)', (e) =>
			e.preventDefault()

			if @http == null
				throw new Error 'Please add Links extension into http object with addExtension method.'

			a = if e.target.nodeName.toLowerCase() == 'a' then $(e.target) else $(e.target).closest('a')
			link = a.attr('href')
			type = if hasAttr(a, 'data-type') then a.attr('data-type').toUpperCase() else 'GET'

			if @http.isHistoryApiSupported() && hasAttr(a, Links.HISTORY_API_ATTRIBUTE)
				window.history.pushState({}, null, link)

			@http.request(link, type: type)
		)


	detach: ->
		$(document).off('.' + Links.EVENT_NAMESPACE)


module.exports = Links