
// load configuration values
require ("dotenv").config();

// include libraries
var express = require ("express")
,   ejs = require ("ejs")
,   http = require ("http")
,   page = require ("./pagemanager.js")
,   database = require ("./databaseaccessor.js")
,   email = require ("./emailaccessor.js");

// initialize express
var app = express ();
app.set ("port", process.env.RUNTIME_PORT);
app.set ("views", __dirname + "/views/layout");
app.engine ("ejs", ejs.renderFile);
app.use (express.static (__dirname + "/public"));

// set api endpoints
app.get ("/sonos/play/clip/:mp3/:volume?", function (req, res) {

    var sonosApiPath = "/" + process.env.SONOS_PLAYER_NAME + "/clip/" + req.params.mp3;
    if (req.params.volume) sonosApiPath += "/" + req.params.volume;

    http.get ({
        host: process.env.SONOS_URI,
        port: 80,
        path: sonosApiPath
    },
    function (sonos_res) {
        //console.log (sonos_res);
        sonos_res.on ("data", function (chunk) {
            console.log("BODY: " + chunk);
        });
        res.send({
            status: 1,
            statusMessage: "Successfully played " + req.params.mp3 + "."
        });
    })
    .on ("error", function (e) {
        console.log (e);
        res.send({
            status: 0,
            statusMessage: e.toString ()
        });
    });

});

// set web endpoints
app.get ("*", function (req, res) {
    page.startTimer ();

    switch (req.url) {
        case "/test-db":

            database.query.getUser (function (data) {
                page.display (res, "home", data);
            });

            break;
        case "/test-email":

            email.send ("general", {
                sender: "admin@dyspro.net",
                message: "<h1>Email contents</h1>"
            },
            function (status) {
                res.setHeader ('Content-Type', 'text/html');
                res.writeHead (res.statusCode);
                res.write ("Sent test email. Status is " + status);
                res.end ();
            });

            break;
        default:

            page.display (res, "home", {Name: "Test"});

            break;
    }

});

// start the server
app.listen (process.env.RUNTIME_PORT);
console.log("Node app is running at localhost on port " + process.env.RUNTIME_PORT + ".");
