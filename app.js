var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
var db = require('./app_modules/lib/db_handler.js');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var session = require('express-session');

var secret = 'workflow';

app.use(session({ secret: secret, resave: true, saveUninitialized: true }));

app.secret = secret;

//Load all the app modules and local libraries
require('./app_modules/lib/utility.js')(app, urlencodedParser, db, jsonParser);
require('./app_modules/api/public/registration.js')(app, urlencodedParser, db, jsonParser);
require('./app_modules/api/public/authentication.js')(app, urlencodedParser, db, jsonParser);
require('./app_modules/api/internal/session.js')(app, urlencodedParser, db, jsonParser);

var uri = "mongodb://localhost:27017/workflow";


//Create schema automatically if the environment is new
MongoClient.connect(uri, (err, db_obj)=>{
    db.setDatabase(db_obj);
    db_obj.listCollections().toArray((err, data) =>{
        if (!data.length) {
            fs.readdirSync('schema', "utf8").forEach((schema)=>{
                var doc = fs.readFileSync('./schema/' + schema, 'utf8');
                var json = JSON.parse(doc);
                db_obj.createCollection(schema.replace('.json', ''), json);
            });
        }
    });
});

//Express server configuration and API
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, ()=>{
    console.log('Example app listening on port 3000!')
});

module.exports = app;