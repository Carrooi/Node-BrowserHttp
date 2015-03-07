Http = null
Links = null


describe 'Extensions.Links', ->

	beforeEach( ->
		Http = new http.Mocks.Http
		Links = new http.Extensions.Links(jQuery)

		Http.addExtension('links', Links)
	)

	afterEach( ->
		Links.detach()
	)

	it 'should send request on click', (done) ->
		Http.receive('test', null, null, 5)

		Http.on 'success', (response, request) ->
			expect(request.type).to.be.equal('GET')
			expect(response.data).to.be.equal('test')
			done()

		$('#tests a.get').click()

		expect(Http.queue.requests).to.have.length(0)		# GET requests are called immediatelly without queue

	it 'should send request on click with POST', (done) ->
		Http.receive('test', null, null, 5)

		Http.on 'success', (response, request) ->
			expect(request.type).to.be.equal('POST')
			expect(response.data).to.be.equal('test')
			done()

		expect(Http.queue.requests).to.have.length(0)

		$('#tests a.post').click();

		expect(Http.queue.requests).to.have.length(1)
