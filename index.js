'use strict'

const request = require('superagent')
const endpoints = require('./lib/endpoints')
const limits = require('limits.js')
const throttle = limits().within(10 * 1000, 39)

module.exports = class {
  constructor(apiKey, baseUrl = 'https://api.themoviedb.org/3/') {
    if (!apiKey) {
      throw new Error('Bad api key')
    }

    this.apiKey = apiKey
    this.baseUrl = baseUrl

    // Create the dynamic api methods using the configuration found in lib/endpoints
    Object.keys(endpoints.methods).forEach(method => {
      const met = endpoints.methods[method]

      Object.keys(met).forEach(m => {
        this[method + m] = (params = {}) => {
          if (!this.token || Date.now() > +new Date(this.token.expires_at)) {
            return this.requestToken()
              .then(() => this.makeRequest(met[m].method, params, met[m].resource))
          }

          return this.makeRequest(met[m].method, params, met[m].resource)
        }
      })
    })
  }

  /**
   * Gets an api token using an api key
   *
   * @returns {Promise}
   */
  requestToken() {
    return new Promise((resolve, reject) => {
      request
        .get(this.baseUrl + endpoints.authentication.requestToken)
        .query({ 'api_key': this.apiKey })
        .end((err, res) => {
          if (err) {
            return reject(err)
          }

          this.token = res.body
          resolve(this.token.request_token)
        })
    })
  }

  /**
   * Gets the session id
   *
   * @returns {Promise}
   */
  session() {
    return new Promise((resolve, reject) => {
      request
        .get(this.baseUrl + endpoints.authentication.session)
        .query({ 'api_key': this.apiKey, 'request_token': this.token.request_token })
        .end((err, res) => {
          if (err || !res.body.success) {
            return reject(err || res.body)
          }

          this.sessionId = res.body.session_id
          resolve(this.sessionId)
        })
    })
  }

  /**
   * Makes the request to the api using the configuration from lib/endpoints
   *
   * @param {String} type The http verb
   * @param {Object} params The parameters to pass to the api
   * @param {String} endpoint The api endpoint relative to the base url
   * @returns {Promise}
   */
  makeRequest(type, params, endpoint) {
    return new Promise((resolve, reject) => {
      // Some endpoints have an optional account_id parameter (when there's a session).
      // If it's not included, assume we want the current user's id,
      // which is setting it to '{account_id}'
      if (endpoint.indexOf(':id') !== -1 && !params.id && this.sessionId) {
        params.id = '{account_id}'
      }

      endpoint = endpoint.replace(':id', params.id).replace(':season_number', params.season_number).replace(':episode_number', params.episode_number)
      type = type.toUpperCase()

      let req = request(type, this.baseUrl + endpoint)
        .query({ api_key: this.apiKey, session_id: this.sessionId })

      if (params.ifNoneMatch) {
        req = req.set('If-None-Match', params.ifNoneMatch)
      } else if (params.ifModifiedSince) {
        let t = params.ifModifiedSince

        if (t.toUTCString) {
          t = t.toUTCString()
        }

        req = req.set('If-Modified-Since', t)
      }

      req[type === 'GET' ? 'query' : 'send'](params)

      throttle.push(() => {
        req.end((err, res) => {
          if (err) {
            return reject(err)
          }

          resolve(res.body, res)
        })
      })
    })
  }
}
