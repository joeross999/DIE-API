var main = require('./main.js')

var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static('public'));

app.use(favicon(__dirname + '/public/images/logo_transparent.ico'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

var cors = require('cors');
app.use(cors({origin: 'null'}));

app.get('/', function(req, res){
  res.render('index');
});

app.post('/init', function(req, res){
  console.log("req.body")
  console.log(req.body)
  result = main.init(req.body);
  res.json({"bots": result.bots.map(bot => {return {'pos': bot.position, 'color': bot.color}}), "world": result.world});
});


app.get('/refresh', function(req, res){
  res.json(main.frame().map(bot => {return {'pos': bot.position, 'color': bot.color}}));
  // res.json(main.frame());
});

app.get('/test', function(req, res){
  res.json(main.test());
});



app.listen(3000);
console.log("Now listening on port 3000");