# MovieDB

node.js library that makes the interaction with themoviedb.org V3 API easy.

## How to install

    npm install moviedb

## How to use

Require MovieDB and provide your themoviedb.org API KEY

    var MovieDB = require('moviedb')('your api key');

Use the api methods as you want, for example:

    mdb.searchMovie({query: 'Alien' }, function(err, res){
      console.log(res);
    });

or

    mdb.movieInfo({id: 666}, function(err, res){
      console.log(res);
    });

now you can also make chain calls

    mdb.searchMovie({query: 'Zoolander' }, function(err, res){
      console.log(res);
    }).movieInfo({id: 123}, function(err, res){
      console.log(res);
    });

## Available methods

All themoviedb.org API v3 methods included. Endpoint methods are included on [a wiki page](https://github.com/impronunciable/moviedb/wiki/Library-endpoints)

## License 
=======

(The MIT License)

Copyright (c) 2012 Dan Zajdband &lt;dan.zajdband@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
