var http = require ("http")
,   sprintf = require ("util").format;

function sendSonosRequest (apiPath, successMessage, callback) {

    http.get ({
        host: process.env.SONOS_URI,
        port: 80,
        path: apiPath
    },
    function (sonos_res) {
        callback (1, successMessage);
    })
    .on ("error", function (e) {
        callback (0, e.toString ());
    });

}

exports.play = function (callback) {

    sendSonosRequest (
        sprintf ("/%s/play", process.env.SONOS_PLAYER_NAME),
        "Successfully updated to playing status.",
        callback
    );

};

exports.pause = function (callback) {

    sendSonosRequest (
        sprintf ("/%s/pause", process.env.SONOS_PLAYER_NAME),
        "Successfully updated to paused status.",
        callback
    );

};

exports.setVolume = function (percent, isDelta, callback) {

    var sonosApiPath = sprintf ("/%s/volume/", process.env.SONOS_PLAYER_NAME);
    if (isDelta && percent > 0) sonosApiPath += sprintf ("+%s", percent);
    else sonosApiPath += percent.toString ();

    sendSonosRequest (
        sonosApiPath,
        "Successfully changed volume.",
        callback
    );

};

exports.setSourceToLineIn = function (callback) {

    sendSonosRequest (
        sprintf ("/%s/linein", process.env.SONOS_PLAYER_NAME),
        "Successfully switched to line in.",
        callback
    );

};

exports.playClip = function (clipFileName, volume, callback) {

    var sonosApiPath = sprintf ("/%s/clip/%s", process.env.SONOS_PLAYER_NAME, clipFileName);
    if (volume) sonosApiPath += sprintf ("/%s", volume);

    sendSonosRequest (
        sonosApiPath,
        sprintf ("Successfully played %s.", clipFileName),
        callback
    );

};

exports.playTextToSpeech = function (text, volume, callback) {

};
