var main = require('./main.js')

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var cors = require('cors');
app.use(cors({origin: 'null'}));

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