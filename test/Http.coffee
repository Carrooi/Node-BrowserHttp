
Http = require 'browser-http'

link = (path = '') -> return 'http://localhost:3000/' + path

describe 'Http', ->

	describe '#get()', ->
		it 'should send request and load its text', (done) ->
			Http.get(link()).then( (response) ->
				expect(response.data).to.be.equal('test')
				done()
			).done()

		it 'should send request and load response as JSON', (done) ->
			Http.get(link('json')).then( (response) ->
				expect(response.data).to.be.eql({message: 'text'})
				done()
			).done()

		it 'should send request with data and load them from response', (done) ->
			Http.get(link('give-back'), data: {first: 'first message'}).then( (response) ->
				expect(response.data).to.be.eql({first: 'first message'})
				done()
			).done()