Http = http.Mocks.Http

describe 'Extensions.Links', ->

	beforeEach( ->
		Http.addExtension('links', new http.Extensions.Links(jQuery))
	)

	afterEach( ->
		Http.extensions = {}
		Http.restore()
		Http.removeAllListeners()
		Http.queue.removeAllListeners()
		Http.queue.requests = []
	)

	it.skip 'should send request on click', (done) ->
		Http.receive('test', null, null, 5)

		Http.on 'success', (response, request) ->
			expect(request.type).to.be.equal('GET')
			expect(response.data).to.be.equal('test')
			done()

		$('#extensionsLinks a.get').click()

		expect(Http.queue.requests).to.have.length(0)		# GET requests are called immediatelly without queue

	it 'should send request on click with POST', (done) ->
		Http.receive('test', null, null, 5)

		Http.on 'success', (response, request) ->
			expect(request.type).to.be.equal('POST')
			expect(response.data).to.be.equal('test')
			done()

		expect(Http.queue.requests).to.have.length(0)

		$('#extensionsLinks a.post').click();

		expect(Http.queue.requests).to.have.length(1)