Http = null
Offline = null


describe 'Extensions.Offline', ->

	beforeEach( ->
		Http = new http.Mocks.Http
		Offline = new http.Extensions.Offline(null, 50)

		Http.addExtension('offline', Offline)
	)

	afterEach( ->
		Offline.stop()
	)

	it 'should call disconnected event', (done) ->
		Http.receive()

		counter = 0

		Http.on 'disconnected', ->
			counter++
			window.setTimeout( ->
				expect(counter).to.be.equal(1)
				done()
			, 200)

		window.setTimeout( ->
			Http.receive(null, null, 404)
		, 200)

	it 'should call connected event', (done) ->
		Http.receive(null, null, 404)

		counter = 0

		Http.on 'connected', ->
			counter++
			window.setTimeout( ->
				expect(counter).to.be.equal(1)
				done()
			, 200)

		window.setTimeout( ->
			Http.receive()
		, 200)