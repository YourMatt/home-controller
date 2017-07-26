
// send an email
exports.send = function (type, data, callback) {

    // evaluate the email type to decide allow additional customizations
    switch (type) {
        case "general":
        default:
            data.recipient = process.env.EMAIL_GENERAL_RECIPIENT;
            data.subject = process.env.EMAIL_GENERAL_SUBJECT;
            emailaccessor_send (data, callback);
            break;
    }

}

function emailaccessor_send (data, callback) {

    // create the email message
    var helper = require ("sendgrid").mail;
    var from_email = new helper.Email(data.sender);
    var to_email = new helper.Email(data.recipient);
    var content = new helper.Content ("text/html", data.message);
    var mail = new helper.Mail(from_email, data.subject, to_email, content);

    // create the email request
    var sg = require ("sendgrid")(process.env.SENDGRID_API_KEY);
    var request = sg.emptyRequest({
        method: "POST",
        path: process.env.SENDGRID_POST_PATH,

        body: mail.toJSON()
    });

    sg.API (request, function (error, response) {

        // log error if invalid
        if (error || response.statusCode != 202) {
            console.log("Error sending email through Sendgrid: " + error);
            console.log(response);
            return callback(false);
        }

        // return if valid response
        else return callback(true);

    });

}