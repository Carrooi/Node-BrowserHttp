Http = null
Xhr = window.http.Xhr


describe 'Http', ->

	beforeEach( ->
		Http = new http.Mocks.Http
	)

	describe '#get()', ->
		it 'should send request and load its text', (done) ->
			Http.receive('test')

			Http.get('localhost').then( (response) ->
				expect(response.data).to.be.equal('test')
				done()
			).done()

		it 'should send request and load response as JSON', (done) ->
			Http.receive('{"message": "text"}', 'content-type': 'application/json')

			Http.get('localhost').then( (response) ->
				expect(response.data).to.be.eql({message: 'text'})
				done()
			).done()

		it 'should send request with data and load them from response', (done) ->
			Http.receive('{"first": "first message"}', 'content-type': 'application/json')

			Http.once 'send', (response, request) ->
				expect(request.xhr.url).to.be.equal('localhost?first=first+message')

			Http.get('localhost', data: {first: 'first message'}).then( (response) ->
				expect(response.data).to.be.eql({first: 'first message'})
				done()
			).done()

		it 'should load json data with prefix', (done) ->
			Http.receive('while(1); {"message": "prefix"}', 'content-type': 'application/json')

			Http.get('localhost', jsonPrefix: 'while(1); ').then( (response) ->
				expect(response.data).to.be.eql(
					message: 'prefix'
				)
				done()
			).done()

		it 'should receive data with exact timeout', (done) ->
			start = (new Date).getTime()

			Http.receive('test', null, null, 200)

			Http.get('localhost').then( (response) ->
				elapsed = (new Date).getTime() - start

				expect(response.data).to.be.equal('test')
				expect(elapsed).to.be.above(199).and.to.be.below(220)

				done()
			).done()

		it 'should receive data with random timeout', (done) ->
			start = (new Date).getTime()

			Http.receive('test', null, null, {min: 100, max: 200})

			Http.get('localhost').then( (response) ->
				elapsed = (new Date).getTime() - start

				expect(response.data).to.be.equal('test')
				expect(elapsed).to.be.above(99).and.to.be.below(225)

				done()
			).done()

	describe '#post()', ->
		it 'should return an error - cross domain request', (done) ->
			Http.receiveError(new Error 'XMLHttpRequest cannot load http://localhost:3000/. Origin file:// is not allowed by Access-Control-Allow-Origin.')

			Http.post('localhost').catch( (err) ->
				expect(err).to.be.instanceof(Error)
				expect(err.message).to.be.equal('Can not load localhost address')
				done()
			).done()

	describe '#jsonp()', ->
		it 'should send jsonp request', (done) ->
			method = Xhr.JSONP_METHOD_PREFIX + (Xhr.COUNTER + 1)

			Http.receive("typeof #{method} === 'function' && #{method}({\n\"message\": \"jsonp text\"\n});", 'content-type': 'application/javascript')

			Http.jsonp('localhost').then( (response) ->
				expect(response.data).to.be.eql({message: 'jsonp text'})
				done()
			).done()
