var http = require ("http")

exports.playClip = function (clipFileName, volume, callback) {

    var sonosApiPath = "/" + process.env.SONOS_PLAYER_NAME + "/clip/" + clipFileName;
    if (volume) sonosApiPath += "/" + volume;

    http.get ({
        host: process.env.SONOS_URI,
        port: 80,
        path: sonosApiPath
    },
    function (sonos_res) {
        /*
         sonos_res.on ("data", function (chunk) {
         console.log(chunk);
         });*/
        callback (1, "Successfully played " + clipFileName + ".");
    })
    .on ("error", function (e) {
        callback (0, e.toString ());
    });

};
