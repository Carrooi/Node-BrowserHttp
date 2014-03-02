
Http = window.http.Mocks.Http
Q = window.http._Q

Q.stopUnhandledRejectionTracking()

link = 'http://localhost:3000/'

describe 'Queue', ->

	afterEach( ->
		Http.restore()
	)

	it 'should send one request', (done) ->
		Http.receive('test')

		Http.get(link).then( (response) ->
			expect(response.data).to.be.equal('test')
			done()
		).done()

	it 'should send all GET requests synchronously', (done) ->
		data = ''
		start = (new Date).getTime()
		timeout =
			min: 50
			max: 150

		onComplete = (error, response) ->
			data += response.data + ''

		Http.on('complete', onComplete)

		Http.queue.once('finish', ->
			Http.removeListener('complete', onComplete)
			elapsed = (new Date).getTime() - start

			expect(data).to.be.equal('12345')
			expect(elapsed).to.be.above(timeout.min * 5 - 1).and.to.be.below(timeout.max * 5 + 5)

			done()
		)

		Http.receiveDataFromRequestAndSendBack('content-type': 'application/json', null, timeout)

		Http.get(link, data: 1, parallel: false)
		Http.get(link, data: 2, parallel: false)
		Http.get(link, data: 3, parallel: false)
		Http.get(link, data: 4, parallel: false)
		Http.get(link, data: 5, parallel: false)

		expect(Http.queue.requests.length).to.be.equal(5)

	it 'should send all GET requests assynchronously', (done) ->
		promises = []
		start = (new Date).getTime()
		timeout =
			min: 50
			max: 150

		Http.receiveDataFromRequestAndSendBack('content-type': 'application/json', null, timeout)

		promises.push Http.get(link, data: 1)
		promises.push Http.get(link, data: 2)
		promises.push Http.get(link, data: 3)
		promises.push Http.get(link, data: 4)

		expect(Http.queue.requests.length).to.be.equal(0)

		Q.all(promises).then( (responses) ->
			elapsed = (new Date).getTime() - start
			data = []
			data.push(response.data) for response in responses

			expect(data).to.have.members([1, 2, 3, 4])
			expect(elapsed).to.be.above(timeout.min - 1).and.to.be.below(timeout.max + 5)

			done()
		).done()