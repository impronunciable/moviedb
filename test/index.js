'use strict'

/* global describe it */
const assert = require('chai').assert
const apiKey = process.env.MOVIEDB_API_KEY || process.env.npm_config_key
const MovieDb = require('../index.js')
require('chai').should()
require('colors')

/**
 * Checks for missing API key.
 *
 * The proper way to run the test:
 * npm test --key='{your api key}'
 */
if (!apiKey || apiKey.length === 0) {
  console.log('You have not provided the API key'.red)
  console.log('\tRunning tests:'.cyan)
  console.log('\tnpm test --key="{your api key}"'.cyan)
  throw new Error('Missing API key, please `run npm test --key="{your api key}"`')
}

const api = new MovieDb(apiKey)

describe('moviedb', function () {
  this.timeout(10000)

  // basic movie search
  it('should search for Zoolander', done => {
    api.searchMovie({ query: 'Zoolander' }).then(res => {
      res.should.be.an('object')
      res.should.have.property('results')
      res.results.should.be.an('array')
      done()
    }).catch(done)
  })

  it('should get the tv shows airing today', done => {
    api.tvAiringToday().then(res => {
      res.should.be.an('object')
      res.should.have.property('results')
      res.results.should.be.an('array')
      done()
    }).catch(done)
  })

  it('should get the tv shows OnTheAir', done => {
    api.tvOnTheAir().then(res => {
      res.should.be.an('object')
      res.should.have.property('results')
      res.results.should.be.an('array')
      done()
    }).catch(done)
  })

  it('should get the movie release dates', done => {
    api.movieReleaseDates({ id: 209112 }).then(res => {
      res.should.be.an('object')
      res.should.have.property('results')
      res.results.should.be.an('array')
      assert.equal(res.id, 209112)
      done()
    }).catch(done)
  })
})
