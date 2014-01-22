
Http = window.http.Mocks.Http
Q = window.http._Q

Q.stopUnhandledRejectionTracking()
link = -> return 'http://localhost:3000/'

describe 'Queue', ->

	afterEach( ->
		Http.restore()
	)

	it 'should send one request', (done) ->
		Http.receive('test')

		Http.get(link()).then( (response) ->
			expect(response.data).to.be.equal('test')
			done()
		).done()

	it 'should send many requests', (done) ->
		buf =
			1: false
			2: false
			3: false
			4: false
			5: false

		Http.on('send', (response, request) ->
			buf[request.data.param] = true
		)

		Http.receive('{"param": "1"}', 'content-type': 'application/json')
		Http.get(link(), data: {param: 1}).then( (response) ->
			expect(
				1: true
				2: true
				3: false
				4: false
				5: false
			).to.be.eql(buf)
			expect(response.data).to.be.eql({param: '1'})
		).done()

		Http.receive('{"param": "2"}', 'content-type': 'application/json')
		Http.get(link('give-back'), data: {param: 2}).then( (response) ->
			expect(
				1: true
				2: true
				3: true
				4: false
				5: false
			).to.be.eql(buf)
			expect(response.data).to.be.eql({param: '2'})
		).done()

		Http.receive('{"param": "3"}', 'content-type': 'application/json')
		Http.get(link('give-back'), data: {param: 3}).then( (response) ->
			expect(
				1: true
				2: true
				3: true
				4: true
				5: false
			).to.be.eql(buf)
			expect(response.data).to.be.eql({param: '3'})
		).done()

		Http.receive('{"param": "4"}', 'content-type': 'application/json')
		Http.get(link('give-back'), data: {param: 4}).then( (response) ->
			expect(
				1: true
				2: true
				3: true
				4: true
				5: true
			).to.be.eql(buf)
			expect(response.data).to.be.eql({param: '4'})
		).done()

		Http.receive('{"param": "5"}', 'content-type': 'application/json')
		Http.get(link('give-back'), data: {param: 5}).then( (response) ->
			expect(
				1: true
				2: true
				3: true
				4: true
				5: true
			).to.be.eql(buf)
			expect(response.data).to.be.eql({param: '5'})
			done()
		).done()

		expect(Http.queue.requests.length).to.be.equal(4)