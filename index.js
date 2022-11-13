// index.js
// where your node app starts


// init project
const express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
var dns = require('dns');
require('dotenv').config();




//Setup DB
//mongoose.connect(process.env.DB_URI)

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//middle-ware

app.use(bodyParser.urlencoded({ extended: true }));

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
//const shortid = require('shortid');
const { json } = require('express');
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
const originalUrls = [];
const shortUrls = [];

app.post("/api/shorturl/new", (req, res) => {
    const url = req.body.url
    const foundIndex = originalUrls.indexOf(url);

    if (!url.includes("https://") && !url.includes("http://")) {
    return res.json({ error: "Invalid url" })
}

    if (foundIndex < 0) {
        originalUrls.push(url)
        shortUrls.push(shortUrls.length)

        return res.json({
            original_url: url,
            short_url: shortUrls.length - 1
        });
    };

    return res.json({
        original_url: url,
        short_url: shortUrls[foundIndex]
    }); 
});

app.get("/api/shorturl/:shorturl", (req, res) => {
    const shorturl = parseInt(req.params.shorturl)
    const foundIndex = shortUrls.indexOf(shorturl);

    if (foundIndex < 0) {
        return res.json({
            "error": "No short URL found for the given input"
        });
    }
    res.redirect(originalUrls[foundIndex])
});
    



    //dns.lookup(host, cb)
    // listen for requests :)
var listener = app.listen(port, () => {
    console.log('Your app is listening on port' + listener.address().port)
});