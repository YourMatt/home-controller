var childProcess = require ("child_process")
,   utils = require ("./utils.js")
,   sprintf = require ("util").format;

// Appends to local file.
exports.writeLog = function (message) {

    childProcess.exec (
        "echo $(date '+%Y-%m-%d %H:%M:%S')' " + message + "' >> " + process.env.LOG_FILE,
        function (error, stdout, stderr) {
            if (! utils.valueIsEmpty (error)) utils.outputError (error.toString());
        }
    )

};

// Formats SSH command.
function GetSSHCommand (sshKey, hostName, userName) {

    return sprintf ("ssh -i %s %s@%s",
        utils.escapeShellParameterValue (sshKey),
        userName,
        hostName
    );

}
