var main = require('./main.js')

var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');

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

// ROUTES
app.get('/', function(req, res){
  res.render('index');
});

app.post('/init', function(req, res){
  result = main.init(req.body);
  res.json({"bots": result.bots.map(bot => {return {'pos': bot.position, 'color': bot.color}}), "world": result.world});
});

app.get('/refresh', function(req, res){
  res.json(main.frame().map(bot => {return {'pos': bot.position, 'color': bot.color}}));
});


app.listen(port);
console.log("Now listening on port " + port);