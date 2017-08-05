
// load configuration values
require ("dotenv").config();

// include libraries
var express = require ("express")
,   ejs = require ("ejs")
,   bodyParser = require("body-parser")
,   api = require ("./apimanager.js")
,   page = require ("./pagemanager.js")
,   shell = require ("./shell.js")
,   sonos = require ("./sonos.js")
,   database = require ("./databaseaccessor.js")
,   email = require ("./emailaccessor.js");

// initialize express
var app = express ();
app.set ("port", process.env.RUNTIME_PORT);
app.set ("views", __dirname + "/views/layout");
app.engine ("ejs", ejs.renderFile);
app.use (bodyParser.json());
app.use (express.static (__dirname + "/public"));

// set api endpoints
app.all ("/test", api.test);
app.get ("/sonos/play", api.sonos.general.play);
app.get ("/sonos/pause", api.sonos.general.pause);
app.get ("/sonos/play/linein", api.sonos.play.linein);
app.get ("/sonos/play/clip/:mp3/:volume?", api.sonos.play.clip);
app.post ("/ifttt/cubsfinalscore", api.ifttt.cubsFinalScore);

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
