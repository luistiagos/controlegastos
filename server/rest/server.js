var cors = require('cors');
var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var _ = require('lodash');
//var MongoClient = require('mongodb').MongoClient;
var app = express();
var iconvlite = require('iconv-lite');
var babyparse = require('babyparse');
var multer  =   require('multer');
//var Dao = require('./dao').Dao;
var dao = undefined;

var upload = multer({ dest: 'uploads/' });

//var url = 'mongodb://localhost:27017/users';

/*
MongoClient.connect(url, function(err, db) {
   if(err) throw err;
   	dao = new Dao(db);
});
*/

app.use(cors());

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

var arrItens = [];

app.post('/upload', upload.single('file'), function (req, res) {
   var data = [];
   console.log(req.file);
   var readerStream = fs.createReadStream(req.file.path);
   readerStream.on('data', function(chunk) {
   	data.push(chunk);
   }).on('end',function(){
        var decodedBody = iconvlite.decode(Buffer.concat(data), 'ISO-8859-9');
	var doc = babyparse.parse(decodedBody);	
	var anoAtual = new Date().getFullYear();

	_.forEach(doc.data,function(item){
	   if (item.length == 7 && item[2]) {
        var tipo = undefined;
        var descricao = undefined;
    		var data = undefined;
        var valor = parseFloat(item[5]);

        if (valor < 0) {
            if(item[2].indexOf(' - ') > 1) {
               var arrItem = item[2].split(' - ');  
               var parsedStr = arrItem[1].trim();  
               var arrObj = parsedStr.split(' ');
               var arrDate = arrObj[0].trim().split('/');
               var arrHour = arrObj[1].trim().split(':');
               tipo = arrItem[0].trim();
               descricao = '';
               for (var i=2;i<arrObj.length;i++) {
                  descricao += arrObj[i];
                  if (i<arrObj.length-1) {
                    descricao += ' ';
                  }
               }
               data = new Date(anoAtual,arrDate[1]-1,arrDate[0],arrHour[0],arrHour[1],0,0);
            }
            else {
               tipo = item[2];
               descricao = tipo;
               arrDate = item[0].trim().split('/');
               data = new Date(anoAtual,arrDate[0]-1,arrDate[1],1,0,0,0);
            }

            var itemContb = {
              id:undefined,
              data:data,
              tipo:tipo,        
              descricao:descricao,
              valor:valor
            };

            itemContb.tipo = (itemContb.tipo.indexOf('Saque') > -1 || 
                  itemContb.tipo.indexOf('Banco 24') > -1)?'SAQUE':
                  (itemContb.tipo.indexOf('Compra') > -1)?'COMPRA':itemContb.tipo;
                
            itemContb.id = ((itemContb.data.getTime() / 1000) + 
              (itemContb.valor.toString().replace('.',''))).replace('-','');    
            arrItens.push(itemContb);  
        } 
     }	     
	});	
	
	fs.unlinkSync(req.file.path);
	res.end("");
   }).on('error', function(err){
        console.log(err.stack);
	res.end('Ocorreu um erro inesperado.');
   });
});

app.get('/gastos', function (req, res) {
   res.end(JSON.stringify(arrItens));
});

var server = app.listen(8181, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

})
