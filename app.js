
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// Let's require the mongodb package
var mongo = require('mongodb');

// Get the MongoClient Object
var mongoClient = mongo.MongoClient;

var MONGODB_URI = process.env.CUSTOMCONNSTR_MONGODB_URI || 'mongodb://localhost:27017/colours';

// Connect to the db. The callback function will be passed two arguments: err - which
// will contain error information, and db - which will contain a connection to the
// mongodb Database
mongoClient.connect(MONGODB_URI, function(err, db) {
  if(!err) {
    console.log("We are connected");
    // Store the connection to the mongodb database on the aplication object
    // under the name db so that I can access in another file
    app.set('db', db);
  }
  else {
    throw err;
  }
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.cookieParser('clonmellit'));
app.use(express.session());

app.use(express.bodyParser());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/addPerson', routes.addPerson);
app.get('/personsColours', routes.personsColours);
app.post('/addColour', routes.addColour);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
