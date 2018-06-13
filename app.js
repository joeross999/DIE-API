var main = require('./main.js')

var express = require('express');
var app = express();

var data = main.init();

var cors = require('cors');
app.use(cors({origin: 'null'}));


app.get('/data', function(req, res){
  res.json(data);
});

app.listen(3000);
console.log("Now listening on port 3000");