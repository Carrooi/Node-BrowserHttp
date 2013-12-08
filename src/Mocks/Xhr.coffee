OriginalXhr = require '../Xhr'

XmlHttpMocks = require '../../Mocks/XmlHttpRequest'

class Xhr extends OriginalXhr


	createXhr: ->
		return new XmlHttpMocks


	receive: (status, data) ->
		return @xhr.receive(status, data)


	receiveError: (err) ->
		return @xhr.err(err)


	setResponseHeader: (name, value) ->
		return @xhr.setResponseHeader(name, value)


module.exports = Xhr