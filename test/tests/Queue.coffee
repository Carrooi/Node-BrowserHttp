
Http = window.http.Mocks.Http
Q = window.http._Q

Q.stopUnhandledRejectionTracking()

link = 'http://localhost:3000/'

describe 'Queue', ->

	afterEach( ->
		Http.restore()
		Http.removeAllListeners()
		Http.queue.removeAllListeners()
	)

	it 'should send one request', (done) ->
		Http.receive('test')

		Http.get(link).then( (response) ->
			expect(response.data).to.be.equal('test')
			done()
		).done()

	it.skip 'should send all GET requests synchronously', (done) ->
		sent = '-----'

		Http.on('send', (response, request) ->
			index = request.data.index
			sent = sent.substr(0, index) + '>' + sent.substr(index + 1)
		)

		Http.receiveDataFromRequestAndSendBack('content-type': 'application/json')

		Http.get(link, data: {index: 0}, parallel: false).then( (response) ->
			expect(sent).to.be.equal('>----')
			expect(response.data).to.be.eql({index: 0})
		).done()

		Http.get(link, data: {index: 1}, parallel: false).then( (response) ->
			expect(sent).to.be.equal('>>---')
			expect(response.data).to.be.eql({index: 1})
		).done()

		Http.get(link, data: {index: 2}, parallel: false).then( (response) ->
			expect(sent).to.be.equal('>>>--')
			expect(response.data).to.be.eql({index: 2})
		).done()

		Http.get(link, data: {index: 3}, parallel: false).then( (response) ->
			expect(sent).to.be.equal('>>>>-')
			expect(response.data).to.be.eql({index: 3})
		).done()

		Http.get(link, data: {index: 4}, parallel: false).then( (response) ->
			expect(sent).to.be.equal('>>>>>')
			expect(response.data).to.be.eql({index: 4})
			done()
		).done()

		expect(Http.queue.requests.length).to.be.equal(4)

	it.skip 'should send all GET requests assynchronously', (done) ->
		Http.receive('test')

		promises = []

		promises.push Http.get(link)
		promises.push Http.get(link)
		promises.push Http.get(link)
		promises.push Http.get(link)

		expect(Http.queue.requests.length).to.be.equal(0)

		Q.all(promises).then( ->
			done()
		).done()