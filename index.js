// index.js
// where your node app starts


// init project
require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dns = require("dns");
const urlparser = require("url");
const app = express();
const port = process.env.PORT || 3000;




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
const schema = new mongoose.Schema({ url: 'string' });
const Url = mongoose.model('Url', schema);

app.post('/api/shorturl/new', (req, res) => {
    const bodyurl = req.body.url;

    const something = dns.lookup(urlparser.parse(bodyurl).hostname, (err, address) => {
        if (!address) {
            res.json({ error: "Invalid URL" })
        } else {
            const url = new Url({ url: bodyurl })
            url.save((err, data) => {
                res.json({
                    original_url: data.url,
                    short_url: data.id
                })
            })
        }
    })
});

app.get("/api/shorturl/new/:id", (req, res) => {
    const id = req.params.id;
    Url.findById(id, (err, data) => {
        if (!data) {
            res.json({ error: "Invalid URL" })
        } else {

            res.redirect(data.url)
        }
    })
});
    

   
    // listen for requests :)
var listener = app.listen(port, () => {
    console.log('Your app is listening on port' + listener.address().port)
});