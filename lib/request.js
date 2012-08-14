
/**
 * Module dependencies
 */

var request = require('superagent')
var endpoints = require('./endpoints.json')
  , methods = endpoints.methods
  , base_url = endpoints.base_url
  , MovieDB = module.exports = module.parent.exports;

/*
 * Generate API methods
 */

Object.keys(methods).forEach(function(method){
  Object.keys(methods[method]).forEach(function(m){
    MovieDB.prototype[method + m] = function(params, fn){
      var self = this;

      if("function" == typeof params) {
        fn = params;
        params = {};
      }

      if(!this.token || Date.now() > +new Date(this.token.expires_at)) {
        this.requestToken(function(){
          execMethod.call(self, methods[method][m].method, params, methods[method][m].resource, fn);
        });    
      } else {
        execMethod.call(this, methods[method][m].method, params, methods[method][m].resource, fn);
      } 
    };

  });
});

var execMethod = function(type, params, endpoint, fn){
  params = params || {};
  endpoint = endpoint.replace(':id', params.id);
  
  var req;

  if(type == "get") {
    req = request.get(base_url + endpoint)
  } else if(type == "post") { 
    req = request.post(base_url + endpoint);
  } else {
    fn(new Error("Method is not well implemented, needs to be a get or post request"), null);
  }
 
  req
  .query({api_key : this.api_key})
  .send(params)
  .set('Accept', 'application/json')
  .end(function(res){
    if(res.ok){
      try{
        var body = JSON.parse(res.text);
        fn(null, body);
      } catch(e){
        fn(e, null);
      }
    } else {
      if(res.body && res.body.status_message){
        fn(new Error(res.body.status_message), null);
      } else {
        fn(res.error, null);
      }
    }
  });
};
