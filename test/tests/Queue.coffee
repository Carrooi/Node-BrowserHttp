Http = null


describe 'Queue', ->

	beforeEach( ->
		Http = new http.Mocks.Http
	)

	it 'should send one request', (done) ->
		Http.receive('test')

		Http.get('localhost', (response) ->
			expect(response.data).to.be.equal('test')
			done()
		)

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
		start = (new Date).getTime()
		timeout =
			min: 50
			max: 150

		Http.receiveDataFromRequestAndSendBack('content-type': 'application/json', null, timeout)

		responses = []
		processResponse = (response) ->
			responses.push response.data

			if responses.length == 4
				elapsed = (new Date).getTime() - start

				expect(responses).to.have.members([1, 2, 3, 4])
				expect(elapsed).to.be.above(timeout.min - 1).and.to.be.below(timeout.max + 5)

				done()

		Http.get('localhost', {data: 1}, processResponse)
		Http.get('localhost', {data: 2}, processResponse)
		Http.get('localhost', {data: 3}, processResponse)
		Http.get('localhost', {data: 4}, processResponse)

		expect(Http.queue.requests.length).to.be.equal(0)

	it 'should remove all pending requests', (done) ->
		Http.receive(null, null, null, 5)

		Http.post('', -> done() )
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
