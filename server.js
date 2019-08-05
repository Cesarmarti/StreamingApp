var express = require('express');
var app = express();
var routes = require('./routes/basicRoutes');

app.use(express.static('public'));
app.use('/', routes);

var server = app.listen(8081, function () {
    console.log("Streaming app running");
})