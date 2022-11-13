// index.js
// where your node app starts


// init project
const express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortId = require('shortid');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config()



//Setup DB
//mongoose.connect(process.env.DB_URI)

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const shortid = require('shortid');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", (req, res) => {
  res.json({greeting: 'hello API'});
});


//Timestamp HTML router

app.get("/timestamp", (req, res) => {
    res.sendFile(__dirname + '/views/timestamp.html');
});

//Request Header parser router

app.get("/requestHeaderParser", (req, res) => {
    res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

//URL Shortner

app.get("/urlShortenerMicroservice", (req, res) => {
    res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
});

// Timestamp Project
app.get("/api/timestamp", (req, res) => {
    var now = new Date()
    res.json({
        "unix": now.getTime(),
        "utc": now.toUTCString()
    });
});



app.get("/api/timestamp/:date_string", (req, res) => {
    let dateString = req.params.date_string;



    if (parseInt(dateString) > 10000) {
        let unixTime = new Date(parseInt(dateString));
        res.json({
            "unix": unixTime.getTime(),
            "utc": unixTime.toUTCString()
        });
    }

    

    let passedInValue = new Date(dateString);

    if (passedInValue == "Invalid Date") {
        res.json({ "error": "Invalid Date" });
    } else {
        res.json({
            "unix": passedInValue.getTime(),
            "utc": passedInValue.toUTCString()
        })
    }
});

//whoami API

app.get("/api/whoami", (req, res) => {

    res.json({
        "ipaddress": req.connection.remoteAddress,
        "language": req.headers["accept-language"],
        "software": req.headers["user-agent"]
     })
});

//URL Shortner
//build schema & model to store urls

var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
    original_url: String,
    suffix: String,
    short_url: String
}));

//parse app/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

//Create app json parser 
var jsonParser = bodyParser.json()

app.post("/api/shorturl/new/", (req, res) => {
    let requestedUrl = req.body.url
    let suffix = shortid.generate();
    let newShortUrl = suffix;

    let newURL = new ShortURL({
        original_url: requestedUrl,
        suffix: suffix,
        short_url: __dirname + "/api/shorturl/" + suffix
    })

    newURL.save((err, doc) => {
        if (err) return console.log(err);
        res.json({
            "saved": true,
            "original_url": newURL.original_url,
            "suffix": newURL.suffix,
            "short_url": newURL.short_url
        });
    });
});

app.get("/api/shorturl/:suffix", (req, res) => {
    let userSuffix = req.params.suffix;
    ShortURL.find({ suffix: userSuffix }).then((foundUrls) => {
        let urlForRedirect = foundUrls[0];
        res.redirect(urlForRedirect.original_url);
        
    });
});



// listen for requests :)
var listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
