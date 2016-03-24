var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient;
var app = express();
var iconvlite = require('iconv-lite');
var babyparse = require('babyparse');
var Dao = require('./dao').Dao;
var dao = undefined;

/*
var url = 'mongodb://localhost:27017/users';

MongoClient.connect(url, function(err, db) {
   if(err) throw err;
   dao = new Dao(db);
});
*/

app.post('/addUser', bodyParser.json(), function (req, res) {
   dao.addUser(req.body, function(doc){
       res.end(JSON.stringify(doc));
   });
});

app.post('/addMultipleUsers', bodyParser.json(), function (req, res) {
   dao.addMultiplyUsers(req.body, function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/listUsers', bodyParser.json(), function (req, res) {
   dao.listUsers(req.body, function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/removeUsers', bodyParser.json(), function (req, res) {
   dao.removeUsers(function(docs){
       res.end(docs);
   });
});

app.get('/getByName:nome', function (req, res) {
   dao.listUsers({nome:req.params.nome}, function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/upsert', bodyParser.json(), function (req, res) {
   dao.upsert(req.body.find,req.body.upsert,function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/removeAttr', bodyParser.json(), function (req, res) {
   dao.removeAttr(req.body.find,req.body.upsert,function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.get('/mapReduce', function (req, res) {
   dao.mapReduce(function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.get('/readStream', function(req, res) {
   var data = [];
   var readerStream = fs.createReadStream('extrato.csv');
   readerStream.on('data', function(chunk) {
   	data.push(chunk);
   }).on('end',function(){
        var decodedBody = iconvlite.decode(Buffer.concat(data), 'ISO-8859-9');
	var doc = babyparse.parse(decodedBody);	
	console.log(doc.data[10][2].split(' - ')[1].substring(0,12).trim());
	
	res.end("");
   }).on('error', function(err){
        console.log(err.stack);
	res.end('Ocorreu um erro inesperado.');
   });
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

})