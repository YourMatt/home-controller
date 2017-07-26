var timeScriptStart = [];

exports.startTimer = function () {
    timeScriptStart = process.hrtime ();
}

exports.display = function (res, pageName, data) {

    var timeDiff = process.hrtime(timeScriptStart);
    var timeProcessMilliseconds = ( ( timeDiff[0] * 1e9 + timeDiff[1] ) / 100000 );

    var pageData = {
        page: pageName,
        process_time: timeProcessMilliseconds
    };

    switch (pageName) {

        case "home":

            pageData.user_name = data.Name;
            res.render ("home.ejs", pageData);

            break;

    }

}