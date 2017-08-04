
// load configuration values
require ("dotenv").config();

// include libraries
var express = require ("express")
,   ejs = require ("ejs")
,   bodyParser = require("body-parser")
,   page = require ("./pagemanager.js")
,   shell = require ("./shell.js")
,   sonos = require ("./sonos.js")
,   database = require ("./databaseaccessor.js")
,   email = require ("./emailaccessor.js")
,   sprintf = require ("util").format;

// initialize express
var app = express ();
app.set ("port", process.env.RUNTIME_PORT);
app.set ("views", __dirname + "/views/layout");
app.engine ("ejs", ejs.renderFile);
app.use (bodyParser.json());
app.use (express.static (__dirname + "/public"));

// set api endpoints
app.all ("/test", function (req, res) {

    shell.writeLog ("Request to " + req.url + " via " + req.method);
    shell.writeLog ("Payload: " + JSON.stringify(req.body));
    res.send({
        status: 1,
        statusMessage: "Successfully logged request."
    });

});
app.get ("/sonos/play/clip/:mp3/:volume?", function (req, res) {

    sonos.playClip (req.params.mp3, req.params.volume, function (status, message) {
        res.send({
            status: status,
            statusMessage: message
        });
    });

});

// set api endpoints for specific ifttt webhooks
app.post ("/ifttt/cubsfinalscore", function (req, res) {

    var scoreInfo = req.body.scoreInfo;
    /* Sample formats: winner is listed first after "Final:"
     Final: Diamondbacks 3 Cubs 0. WP: ARI Z Godley (5-4) LP: CHC J Arrieta (10-8) SV: ARI F Rodney (23) (ESPN)
     Final: Cubs 16 Diamondbacks 4. WP: CHC H Rondon (3-1) LP: ARI P Corbin (8-10) (ESPN)
     */

    // determine the game winner
    var scoreInfoWords = (scoreInfo) ? scoreInfo.split(" ") : [];
    var cubsWon = (scoreInfoWords.length >= 5 && scoreInfoWords[1] === "Cubs");

    // perform actions for winning game
    if (cubsWon) {
        shell.writeLog (sprintf ("Request to %s resulted in game win action.", req.url));
        shell.writeLog (sprintf ("Payload: %s", JSON.stringify(req.body)));

        // play the clip and respond without waiting for Sonos response since doesn't return until after clip has finished playing
        sonos.playClip (process.env.CUBS_WIN_CLIP, process.env.CUBS_WIN_VOLUME, function (status, message) {
            shell.writeLog (sprintf ("Sonos clip play response: %s", message))
        });
        res.send ({
            status: 1,
            statusMessage: "Performed action for winning game."
        });

    }

    // perform actions for losing game
    else {
        shell.writeLog (sprintf ("Request to %s resulted in no action.", req.url));
        shell.writeLog (sprintf ("Payload: %s", JSON.stringify(req.body)));

        res.send ({
            status: 1,
            statusMessage: "No action performed."
        });

    }

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
