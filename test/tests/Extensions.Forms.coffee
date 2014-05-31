Http = null
Forms = null


describe 'Extensions.Forms', ->

	beforeEach( ->
		Http = new http.Mocks.Http
		Forms = new http.Extensions.Forms($)

		Http.addExtension('forms', Forms)
	)

	afterEach( ->
		Forms.detach()
	)

	it 'should send form', (done) ->
		Http.receiveDataFromRequestAndSendBack({'content-type': 'application/json'})

		Http.on 'success', (response, request) ->
			expect(request.type).to.be.equal('GET')
			expect(request.url).to.be.equal(window.location.href)
			expect(response.data).to.be.eql(
				'allow[]': ['on', 'on']
				firstName: 'John'
				lastName: 'Doe'
			)
			done()

		$('#tests form.base').submit()

	it 'should send form with button click', (done) ->
		Http.receiveDataFromRequestAndSendBack({'content-type': 'application/json'})

		Http.on 'success', (response) ->
			expect(response.data).to.be.eql(
				add: 'Add checkbox'
				'allow[]': ['on', 'on']
				firstName: 'John'
				lastName: 'Doe'
			)
			done()

		$('#tests form.base input[name="add"]').click()

	it 'should send form with different action and method', (done) ->
		Http.receiveDataFromRequestAndSendBack({'content-type': 'application/json'})

		Http.on 'success', (response, request) ->
			expect(request.type).to.be.equal('POST')
			expect(request.url).to.be.equal('google.com')
			expect(response.data).to.be.eql(
				name: 'some name'
			)
			done()

		$('#tests form.custom').submit()

	it 'should send non-ajax form with ajax button', (done) ->
		Http.receiveDataFromRequestAndSendBack({'content-type': 'application/json'})

		Http.on 'success', (response) ->
			expect(response.data).to.be.eql(
				add: 'Add name'
				name: 'another name'
			)
			done()

		$('#tests form.button input[name="add"]').click()