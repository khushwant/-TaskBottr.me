var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
var multer  = require('multer');
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var url = 'mongodb://localhost:27017/conFusion';
var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './images')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

var upload = multer({ storage: storage })
        
app.use(express.static('images'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/feature3.htm', function (req, res) {
           res.sendFile( __dirname + "/" + "feature3.htm" );
})

app.get('/views/uploaded/:id', function (req, res) {
        
        
        MongoClient.connect(url, function (err, db) 
                {
                    assert.equal(err,null);
                    console.log("Connected correctly to server");
                    var collection = db.collection("formData2");
                    collection.find({'id':req.params.id}).toArray(function(err,docs)
                    {
                        assert.equal(err,null);
                        console.log(req.params.id);
                        res.sendFile( __dirname + "/" + docs[docs.length-1].filepath);
                        
                        
                    });
             
                      db.close();
                });
            
        
    })


app.post('/image_upload', upload.single('file'), function (req, res) 
{
           fs.readFile( req.file.path, 'base64', function (err, data) 
            {
                if( err )
                {
                    console.log( err );
                }
                else
                {
                       response = {
                                filepath: req.file.path,
                                id:"a1"
                       };
                }
                console.log( response );
                MongoClient.connect(url, function (err, db) 
                {
                    assert.equal(err,null);
                    console.log("Connected correctly to server");
                    var collection = db.collection("formData2");
                    collection.insertOne(response, function(err,result)
                    {
                        assert.equal(err,null);
                        console.log("After Insert:");
                        console.log(result.ops);
                    });
                      db.close();
                });
                 res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('added image with access URL: http://localhost:8081/views/uploaded/a1');
           });
})

        var server = app.listen(8081,'localhost' ,function () 
        {
           var host = server.address().address
           var port = server.address().port

           console.log("Example app listening at http://%s:%s", host, port)
        })