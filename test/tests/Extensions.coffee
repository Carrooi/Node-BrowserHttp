
Http = window.http.Mocks.Http

link = 'http://localhost:3000/'

describe 'Extensions', ->

	afterEach( ->
		Http.extensions = {}
		Http.restore()
	)

	describe '#addExtension()', ->
		it 'should add new extension', ->
			Http.addExtension 'snippet', {}
			expect(Http.extensions).to.include.keys 'snippet'

	describe '#removeExtension()', ->
		it 'should remove added extension', ->
			Http.addExtension 'snippet', {}
			Http.removeExtension 'snippet'
			expect(Http.extensions).to.be.eql({})

		it 'should throw an error if extension does not exists', ->
			expect( -> Http.removeExtension 'snippet' ).to.throw(Error)

	describe '#callExtensions()', ->
		it 'should call success event after response is recieved', (done) ->
			Http.addExtension 'test',
				success: (response) ->
					expect(response.data).to.be.equal('test')
					done()

			Http.receive('test')

			Http.get(link)