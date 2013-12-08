
Http = require 'browser-http/Mocks/Http'
Xhr = require 'browser-http/Xhr'
Q = require 'q'

Q.stopUnhandledRejectionTracking()
link = 'http://localhost:3000/'

describe 'Http', ->

	afterEach( ->
		Http.restore()
	)

	describe '#get()', ->
		it 'should send request and load its text', (done) ->
			Http.receive('test')

			Http.get(link).then( (response) ->
				expect(response.data).to.be.equal('test')
				done()
			).done()

		it 'should send request and load response as JSON', (done) ->
			Http.receive('{"message": "text"}', 'content-type': 'application/json')

			Http.get(link).then( (response) ->
				expect(response.data).to.be.eql({message: 'text'})
				done()
			).done()

		it 'should send request with data and load them from response', (done) ->
			Http.receive('{"first": "first message"}', 'content-type': 'application/json')

			promise = Http.get(link, data: {first: 'first message'})
			promise.request.on 'send', (response, request) ->
				expect(request.xhr.url).to.be.equal('http://localhost:3000/?first=first+message')

			promise.then( (response) ->
				expect(response.data).to.be.eql({first: 'first message'})
				done()
			).done()

	describe '#post()', ->
		it 'should return an error - cross domain request', (done) ->
			Http.receiveError(new Error 'XMLHttpRequest cannot load http://localhost:3000/. Origin file:// is not allowed by Access-Control-Allow-Origin.')

			Http.post(link).fail( (err) ->
				expect(err).to.be.instanceof(Error)
				expect(err.message).to.be.equal('Can not load http://localhost:3000/ address')
				done()
			).done()

	describe '#jsonp()', ->
		it 'should send jsonp request', (done) ->
			method = Xhr.JSONP_METHOD_PREFIX + (Xhr.COUNTER + 1)

			Http.receive("typeof #{method} === 'function' && #{method}({\n\"message\": \"jsonp text\"\n});", 'content-type': 'application/javascript')

			Http.jsonp(link).then( (response) ->
				expect(response.data).to.be.eql({message: 'jsonp text'})
				done()
			).done()