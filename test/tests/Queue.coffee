Http = null
Q = window.http._Q


describe 'Queue', ->

	beforeEach( ->
		Http = new http.Mocks.Http
	)

	it 'should send one request', (done) ->
		Http.receive('test')

		Http.get('localhost').then( (response) ->
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

		Http.get('localhost', data: 1, parallel: false)
		Http.get('localhost', data: 2, parallel: false)
		Http.get('localhost', data: 3, parallel: false)
		Http.get('localhost', data: 4, parallel: false)
		Http.get('localhost', data: 5, parallel: false)

		expect(Http.queue.requests.length).to.be.equal(5)

	it 'should send all GET requests assynchronously', (done) ->
		promises = []
		start = (new Date).getTime()
		timeout =
			min: 50
			max: 150

		Http.receiveDataFromRequestAndSendBack('content-type': 'application/json', null, timeout)

		promises.push Http.get('localhost', data: 1)
		promises.push Http.get('localhost', data: 2)
		promises.push Http.get('localhost', data: 3)
		promises.push Http.get('localhost', data: 4)

		expect(Http.queue.requests.length).to.be.equal(0)

		Q.all(promises).then( (responses) ->
			elapsed = (new Date).getTime() - start
			data = []
			data.push(response.data) for response in responses

			expect(data).to.have.members([1, 2, 3, 4])
			expect(elapsed).to.be.above(timeout.min - 1).and.to.be.below(timeout.max + 5)

			done()
		).done()

	it 'should remove all pending requests', (done) ->
		Http.receive(null, null, null, 5)

		Http.post('').then( -> done() )
		Http.post('')
		Http.post('')
		Http.post('')

		expect(Http.queue.requests).to.have.length(4)

		Http.queue.removePending()

		expect(Http.queue.requests).to.have.length(1)

	it 'should remove all pending requests and abort current request', ->
		Http.receive(null, null, null, 5)

		Http.post('')
		Http.post('')
		Http.post('')
		Http.post('')

		expect(Http.queue.requests).to.have.length(4)

		aborted = false
		request = Http.queue.getCurrentRequest()
		request.on 'abort', ->
			aborted = true

		Http.queue.stop()

		expect(aborted).to.be.true
		expect(Http.queue.requests).to.have.length(0)