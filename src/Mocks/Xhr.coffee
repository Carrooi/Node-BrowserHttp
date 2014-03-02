OriginalXhr = require '../Xhr'

XmlHttpMocks = require './XmlHttpRequest'

class Xhr extends OriginalXhr


	createXhr: ->
		return new XmlHttpMocks


	receive: (status, data, timeout = null) ->
		return @xhr.receive(status, data, timeout)


	receiveError: (err) ->
		return @xhr.err(err)


	setResponseHeader: (name, value) ->
		return @xhr.setResponseHeader(name, value)


module.exports = Xhr