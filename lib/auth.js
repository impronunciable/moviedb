
/**
 * Module dependencies
 */

var request = require('superagent')
  , endpoints = require('./endpoints.json')
  , MovieDB = module.parent.exports;


MovieDB.prototype.requestToken = function(fn){
  var that = this;

  request
  .get(endpoints.base_url  + endpoints.authentication.requestToken)
  .send({api_key: that.api_key})
  .set('Accept', 'application/json')
  .end(function(res){
    if(res.ok) that.token = res.body;
    else throw new Error('Invalid authentication');

    fn();
  });
};

