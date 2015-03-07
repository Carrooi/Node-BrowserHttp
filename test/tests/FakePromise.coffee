Http = null


describe 'FakePromise', ->

	beforeEach( ->
		Http = new http.Mocks.Http
	)

	it 'should throw an error', ->
		Http.receive('test')

		expect( ->
			Http.get('localhost').then()
		).to.throw(Error, 'Please, use callbacks instead of promise pattern.')
