
/**
 * Module dependencies
 */

var request = require('superagent')
var endpoints = require('./endpoints.json')
  , methods = endpoints.methods
  , base_url = endpoints.base_url
  , MovieDB = module.exports = module.parent.exports;

var get, post;

Object.keys(methods).forEach(function(method){
  get = methods[method].get;
  post = methods[method].post;

  // GET requests
  
  Object.keys(methods[method].get).forEach(function(g){

    MovieDB.prototype[method + g] = function(params, fn){

      var that = this;

      if(!this.token || Date.now() > +new Date(this.token.expires_at)) {

        this.requestToken(function(){
          execMethod.call(that, 'get', params, methods[method].get[g], fn);
        });    

      } else {
    
        execMethod.call(this, 'get', methods[method].get[g], fn);

      } 

    };

  });

  // POST requests
  Object.keys(methods[method].post).forEach(function(p){

    MovieDB.prototype[method + p] = function(params, fn){

      var that = this;

      if(!this.token || Date.now() > +new Date(this.token.expires_at)) {

        this.requestToken(function(){
          execMethod.call(that, 'post', params, methods[method].post[p], fn);
        });    

      } else {
    
        execMethod.call(this, 'post', params, methods[method].post[p], fn);

      } 

    };

  });

});

var execMethod = function(type, params, endpoint, fn){
  
  params = params || {};
  endpoint = endpoint.replace(':id', params.id);
  delete params.id;

  if(type === 'post'){
    request
    .post(base_url + endpoint)
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
        fn(res.error, null);
      }
    });

  } else {
    request
    .get(base_url + endpoint)
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
        fn(res.error, null);
      }
    });
  }
};
