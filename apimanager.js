var shell = require ("./shell.js")
,   sonos = require ("./sonos.js")
,   sprintf = require ("util").format;

// set authentication scheme - using a simple token comparison method since URL won't be publicly known, and IFTTT
// webhooks aren't able to send custom HTTP headers to support more standard authentication
function authenticateToken (token, res) {

    if (token !== process.env.AUTH_TOKEN) {
        res.send ({
            status: 0,
            statusMessage: "Invalid auth token."
        });
        return false;
    }

    return true;

}

// test any request or response
exports.test = function (req, res) {

    shell.writeLog ("Request to " + req.url + " via " + req.method);
    shell.writeLog ("Payload: " + JSON.stringify (req.body));
    res.send ({
        status: 1,
        statusMessage: "Successfully logged request."
    });

};

// handles sonos actions
exports.sonos = {

    // any general playback controls
    general: {

        play: function (req, res) {
            if (! authenticateToken (req.headers.authtoken, res)) return;

            sonos.play (function (status, message) {
                res.send({
                    status: status,
                    statusMessage: message
                });
            });

        },

        pause: function (req, res) {
            if (! authenticateToken (req.headers.authtoken, res)) return;

            sonos.pause (function (status, message) {
                res.send({
                    status: status,
                    statusMessage: message
                });
            });

        }

    },

    // any action that requires playback
    play: {

        // play line in as source
        linein: function (req, res) {
            if (! authenticateToken (req.headers.authtoken, res)) return;

            sonos.setSourceToLineIn (function (status, message) {
                res.send({
                    status: status,
                    statusMessage: message
                });
            });

        },

        // play an MP3 file from the controller static/clips directory
        clip: function (req, res) {
            if (! authenticateToken (req.headers.authtoken, res)) return;

            sonos.playClip (req.params.mp3, req.params.volume, function (status, message) {
                res.send({
                    status: status,
                    statusMessage: message
                });
            });

        }

    }

};

// handles ifttt actions - these should only be consumed by IFTTT WebHooks
exports.ifttt = {

    cubsFinalScore: function (req, res) {
        if (! authenticateToken (req.body.authToken, res)) return;

        var scoreInfo = req.body.scoreInfo;
        /* Sample formats: winner is listed first after "Final:"
         Final: Diamondbacks 3 Cubs 0. WP: ARI Z Godley (5-4) LP: CHC J Arrieta (10-8) SV: ARI F Rodney (23) (ESPN)
         Final: Cubs 16 Diamondbacks 4. WP: CHC H Rondon (3-1) LP: ARI P Corbin (8-10) (ESPN)
         */

        // determine the game winner
        var scoreInfoWords = (scoreInfo) ? scoreInfo.split (" ") : [];
        var cubsWon = (scoreInfoWords.length >= 5 && scoreInfoWords[1] === "Cubs");

        // perform actions for winning game
        if (cubsWon) {
            shell.writeLog (sprintf ("Request to %s resulted in game win action.", req.url));
            shell.writeLog (sprintf ("Payload: %s", JSON.stringify (req.body)));

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

    }

};