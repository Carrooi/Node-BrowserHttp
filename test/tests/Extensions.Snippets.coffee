Http = null

describe 'Extensions.Snippets', ->

	beforeEach( ->
		Http = new http.Mocks.Http
		Http.addExtension('snippets', new http.Extensions.Snippets)
	)

	it 'should update snippets html', ->
		Http.receive({snippets: {snippetUpdate: 'after'}}, {'content-type': 'application/json'})

		expect($('#snippetUpdate').html()).to.be.equal('before')

		Http.get('')

		expect($('#snippetUpdate').html()).to.be.equal('after')

	it 'should append html to snippet', ->
		Http.receive({snippets: {snippetAppend: ', two'}}, {'content-type': 'application/json'})

		expect($('#snippetAppend').html()).to.be.equal('one')

		Http.get('')

		expect($('#snippetAppend').html()).to.be.equal('one, two')