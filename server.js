var express = require('express');
var fortune = require('fortune');
var nedbAdapter = require('fortune-nedb');
var jsonapi = require('fortune-json-api');

// Új tároló (alapértelmezetten memóriában tárol)
var store = fortune({
    adapter: {
        type: nedbAdapter,
        options: { dbPath: __dirname + '/.db' }
    },
    serializers: [{ type: jsonapi }]
});

store.defineType('subject', {
    name:       {type: String},
    credit:     {type: Number},
    user:       {link: 'user', inverse: 'subjects'},
});

store.defineType('user', {
    firstName:  {type: String},
    lastName:   {type: String},
    neptun:      {type: String},
    password:   {type: String},
    online:     {type: Boolean},
    subjects:   {link: 'subject', inverse: 'user', isArray: true},
});


var server = express();

// Express middleware
// Minden URL-ről engedélyezzük a hozzáférést az API-hoz
// Mindenképp a `server.use(fortune.net.http(store));` sor elé kerüljön
server.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
server.use(fortune.net.http(store));


var port = process.env.PORT || 8080;
store.connect().then(function () {
    server.listen(port, function () {
        console.log('JSON Api server started on port ' + port);
    });
});