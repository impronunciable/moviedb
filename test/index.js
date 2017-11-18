'use strict'

/* global describe it */
const assert = require('chai').assert
const apiKey = process.env.MOVIEDB_API_KEY || process.env.npm_config_key
const MovieDb = require('../index.js')

// Include --sesion='{your session id}' to test the watchlist
const sessionId = process.env.MOVIEDB_SESSION_ID || process.env.npm_config_session

const haveValidGenericResponse = res => {
  res.should.be.an('object')
  res.should.have.property('results')
  res.results.should.be.an('array')
}

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
  this.timeout(30000)

  // basic movie search
  it('should search for Zoolander', done => {
    api.searchMovie({ query: 'Zoolander' }).then(res => {
      haveValidGenericResponse(res)
      done()
    }).catch(done)
  })

  it('should get the tv shows airing today', done => {
    api.tvAiringToday().then(res => {
      haveValidGenericResponse(res)
      done()
    }).catch(done)
  })

  it('should get the tv shows OnTheAir', done => {
    api.tvOnTheAir().then(res => {
      haveValidGenericResponse(res)
      done()
    }).catch(done)
  })

  it('should get the movie release dates', done => {
    api.movieReleaseDates({ id: 209112 }).then(res => {
      haveValidGenericResponse(res)
      assert.equal(res.id, 209112)
      done()
    }).catch(done)
  })

  it(`should accept a non-object parameter if there's only one endpoint placeholder`, done => {
    api.tvInfo(61888).then(res => {
      res.should.be.an('object')
      res.should.have.property('name')
      done()
    }).catch(done)
  })

  if (sessionId) {
    it(`should fetch the user's watchlist without including the account id in the call`, done => {
      api.sessionId = sessionId

      api.accountMovieWatchlist().then(res => {
        haveValidGenericResponse(res)
        done()
      }).catch(done)
    })
  }

  it('should not get a rate limit error when a lot of requests are made within 10 seconds', done => {
    const requests = 50
    let finishedRequests = 0
    let i = 0

    // Requests need to be fired asynchronously
    while (i < requests) {
      api.discoverMovie().then(() => {
        if (++finishedRequests === requests) {
          done()
        }
      }).catch(done)

      i++
    }
  })
})
