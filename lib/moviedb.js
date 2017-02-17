
/*
 * Module dependencies
 */

var request = require('superagent');
var limits = require('limits.js');

var endpoints = require('./endpoints.json');

/*
 * Exports the constructor
 */

module.exports = function(api_key, timeLimit, requestsLimit, base_url) {
  if(api_key) return new MovieDB(api_key, timeLimit, requestsLimit, base_url);
  else throw new Error('Bad api key');
};

/*
 * Constructor
 */

function MovieDB(api_key, timeLimit, requestsLimit, base_url) {
  if(typeof timeLimit === 'undefined'){
    timeLimit = 10500;
  }
  if(typeof requestsLimit === 'undefined'){
    requestsLimit = 40;
  }
  this.api_key = api_key;
  this.queue = limits();
  this.queue.within(timeLimit, requestsLimit);
  if(base_url) endpoints.base_url = base_url;
  return this;
}

/*
 * API request token
 */

MovieDB.prototype.requestToken = function(fn){
  var self = this;

  this.queue.push(function(){
    request
    .get(endpoints.base_url  + endpoints.authentication.requestToken)
    .query({'api_key': self.api_key})
    .set('Accept', 'application/json')
    .end(function(err, res){
      if(err) {
        fn(err);
      } else {
        self.token = res.body;
        fn();
      }
    });
  });

  return this;
};

/*
 * API session
 */

MovieDB.prototype.session = function(fn){
  var self = this;

  this.queue.push(function(){
    request
    .get(endpoints.base_url  + endpoints.authentication.session)
    .query({'api_key': self.api_key, 'request_token': self.token.request_token})
    .set('Accept', 'application/json')
    .end(function(err, res){
      if(err) {
        fn(err);
      } else {
        if (res.body.success) {
          self.session_id = res.body.session_id;
          fn();   
        } 
        else fn(res.body);
      }
    });
  });

  return this;
};

/*
 * Generate API methods
 */

Object.keys(endpoints.methods).forEach(function(method){
  var met = endpoints.methods[method];
  Object.keys(met).forEach(function(m){
    MovieDB.prototype[method + m] = function(params, fn){
      var self = this;

      if("function" == typeof params) {
        fn = params;
        params = {};
      }

      if(!self.token || Date.now() > +new Date(self.token.expires_at)) {
        self.requestToken(function(err){
          if(err) return fn(err);
          execMethod.call(self, met[m].method, params, met[m].resource, fn);
        });
      } else {
        execMethod.call(self, met[m].method, params, met[m].resource, fn);
      }

      return this;
    };
  });
});

var execMethod = function(type, params, endpoint, fn){
  var self = this;
  params = params || {};
  endpoint = endpoint.replace(':id', params.id).replace(':season_number', params.season_number).replace(':episode_number', params.episode_number);
  type = type.toUpperCase();
  
  this.queue.push(function(){
    var req = request(type, endpoints.base_url + endpoint)
              .query({api_key : self.api_key, session_id: self.session_id})
              .set('Accept', 'application/json');

    if (params.ifNoneMatch) {
      req=req.set('If-None-Match', params.ifNoneMatch);

    } else if (params.ifModifiedSince) {
      var t=params.ifModifiedSince;
      if (t.toUTCString) {
        t=t.toUTCString();
      }
      req=req.set('If-Modified-Since', t);
    }

    if(type === 'GET')
      req.query(params);
    else
      req.send(params);

    req.end(function(err, res){
      if(err){
        fn(err, null, res);
      } else {
        fn(null, res.body, res);
      }
    });
  });
};
