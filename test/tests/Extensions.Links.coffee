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
	)

	it 'should send ajax request with link', (done) ->
		Http.receive('test', null, null, 5)

		expect(Http.queue.requests).to.have.length(0)

		$('#extensionsLinks a').click();

		expect(Http.queue.requests).to.have.length(1)

		Http.on 'success', (response) ->
			expect(response.data).to.be.equal('test')
			done()