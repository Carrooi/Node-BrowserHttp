BaseExtension = require './BaseExtension'


$ = null


class Forms extends BaseExtension


	constructor: (jQuery) ->
		$ = jQuery

		$(document).on('submit', 'form.ajax:not(.not-ajax)', @onFormSubmitted)							# form.ajax
		$(document).on('click', 'form.ajax:not(.not-ajax) input[type="submit"]', @onFormSubmitted)		# form.ajax input[type=submit]
		$(document).on('click', 'form input[type="submit"].ajax', @onFormSubmitted)						# form		input[type=submit].ajax


	onFormSubmitted: (e) =>
		e.preventDefault()

		if @http == null
			throw new Error 'Please add Forms extension into http object with addExtension method.'

		el = $(e.target)
		sendValues = {}

		if el.is(':submit')
			form = el.closest('form')
			sendValues[el.attr('name')] = el.val() or ''
		else if el.is('form')
			form = el
		else
			return null

		if form.get(0).onsubmit && form.get(0).onsubmit() == false
			return null

		values = form.serializeArray()

		for value, i in values
			name = value.name

			if typeof sendValues[name] == 'undefined'
				sendValues[name] = value.value
			else
				val = sendValues[name]
				val = [val] if Object.prototype.toString.call(val) != '[object Array]'
				val.push(value.value)
				sendValues[name] = val

		options =
			data: sendValues
			type: form.attr('method') or 'GET'

		@http.request(form.attr('action'), options)



module.exports = Forms