var main = require('./main.js')

var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors({origin: 'null'}));


app.get('/init', function(req, res){
  res.json(main.init());
});


app.get('/refresh', function(req, res){
  res.json(main.frame().map(bots => bots.position));
});



app.listen(3000);
console.log("Now listening on port 3000");