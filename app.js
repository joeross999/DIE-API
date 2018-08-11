var main = require('./main.js')

var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var session = require('express-session')

var port = 3000

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static('public'));

app.use(favicon(__dirname + '/public/images/favicon.png'));

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
}))

// ROUTES
app.get('/', function(req, res){
  res.render('index');
});
let testUser = "TESTUSER"
app.post('/init', function(req, res){
  main.init(req.body, res, req.sessionID);
  console.log(req.sessionID)
});

app.get('/refresh', function(req, res){
  main.frame(res, req.sessionID);
});


app.listen(port);
console.log("Now listening on port " + port);