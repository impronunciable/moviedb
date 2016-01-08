
/*
 * Module dependencies
 */

var request = require('superagent');
var endpoints = require('./endpoints.json');

/*
 * Exports the constructor
 */

module.exports = function(api_key, base_url) {
  if(api_key) return new MovieDB(api_key, base_url);
  else throw new Error('Bad api key');
};

/*
 * Constructor
 */

function MovieDB(api_key, base_url) {
  this.api_key = api_key;
  if(base_url) endpoints.base_url = base_url;
  return this;
}

/*
 * Rate Limits
 */

MovieDB.maxConcurrent = 20;
MovieDB.maxDuration = 10000;
MovieDB.maxRate = 40;

/*
 * API auth
 */

MovieDB.prototype.requestToken = function(fn){
  var self = this;

  MovieDB.queue(this, function() {
    request
    .get(endpoints.base_url  + endpoints.authentication.requestToken)
    .query({'api_key': self.api_key})
    .set('Accept', 'application/json')
    .end(function(res){
      if(!res.ok) return fn(res.error);
      self.token = res.body;
      MovieDB.queue(self);
      fn();
    }).on('error', function(error){
      fn(error);
    });
  });
  this.token = true;

  return;
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

      if(!this.token || Date.now() > +new Date(this.token.expires_at)) {
        this.requestToken(function(err){
          if(err) return fn(err);
        });
      }
      execMethod.call(this, met[m].method, params, met[m].resource, fn);

      return this;
    };
  });
});

/*
 * Manage Queued requests
 */

MovieDB.requestTimes = [0];
MovieDB.requestCurrent = 0;
MovieDB.requestQueue = [];
MovieDB.nextRequest = false;
MovieDB.queue = function(movieDB, fn) {
  // there might be a pending call to this function
  clearTimeout(MovieDB.nextRequest);

  // enqueue
  if (fn) {
    MovieDB.requestQueue.push(fn);
  }

  // trim to last maxRate requests
  while (MovieDB.requestTimes.length > MovieDB.maxRate) {
    MovieDB.requestTimes.shift();
  }

  while (
    (MovieDB.requestCurrent < MovieDB.maxConcurrent) &&
    ((Date.now() - MovieDB.requestTimes[0]) > MovieDB.maxDuration) &&
    (MovieDB.requestQueue.length) &&
    (movieDB.token !== true)
    ) {
    // if under limits fire request
    MovieDB.requestQueue.shift()();
    MovieDB.requestTimes.push(Date.now());
    MovieDB.requestCurrent += 1;
  }

    // no more queued items
  if (MovieDB.requestQueue.length == 0) {
    return;
  } else if (
    (MovieDB.requestCurrent < MovieDB.maxConcurrent) &&
    (movieDB.token !== true)
    ) {
    // if bound by rate, delay
    MovieDB.nextRequest = setTimeout(function() {
      MovieDB.queue(movieDB);
    }, MovieDB.maxDuration - (Date.now() - MovieDB.requestTimes[0]));
  } else if (movieDB.token == true) {
    // waiting for token
  } else {
    // waiting for a response to clear
  }
};

var execMethod = function(type, params, endpoint, fn){
  var self = this;
  params = params || {};
  endpoint = endpoint.replace(':id', params.id).replace(':season_number', params.season_number).replace(':episode_number', params.episode_number);
  type = type.toUpperCase();
  var req = request(type, endpoints.base_url + endpoint)
            .query({api_key : this.api_key})
            .set('Accept', 'application/json');

  MovieDB.queue(self, function() {
    if(type === 'GET')
      req.query(params);
    else
      req.send(params);
    req.end(function(res){
      //
      if(res.ok) {
        fn(null, res.body);
      } else {
        fn(res.error, null);
      }
      MovieDB.requestCurrent -= 1;
      MovieDB.queue(self);
    });
  });

  req.on('error', fn);
};
