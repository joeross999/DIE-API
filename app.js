var main = require('./main.js')

var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/die-project', express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

// Session Setup
app.set('trust proxy', 1)
app.use(session({
  secret: 'SessionSecret...',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ROUTES
app.get('/', function(req, res){
  res.render('index');
});
let testUser = "TESTUSER"
app.post('/init', function(req, res){
  global[req.sessionID] = {};
  main.init(req.body, res, req.sessionID);
});

app.get('/refresh', function(req, res){
  global[req.sessionID] = {};
  main.frame(res, req.sessionID);
});

module.exports = app;