var mysql = require ("mysql");

exports.query = {

    // TEMPORARY sample query
    getUser: function (callback) {

        exports.access.selectSingle ({
            sql:    "select * " +
                    "from   Users " +
                    "where  UserId = ? ",
            values: [1]
        },
        callback);

    }

};

exports.access = {

    db: null,

    init: function () {

        // create the db connection
        this.db = mysql.createConnection ({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // connect to the database
        this.db.connect (function (error) {
            if (error) {
                console.log('Error connecting to Db: ' + error);
                return;
            }
        });

    },

    close: function () {

        // close the database connection
        this.db.end ();

    },

    handleError: function (query, error) {

        // write error data to logs
        console.log ("Error running query: " + error);
        console.log (query);

    },

    selectSingle: function (query, callback) {

        this.selectMultiple (query, callback, true);

    },

    // run a query against the database
    selectMultiple: function (query, callback, returnSingle) {

        this.init();

        // run the query
        this.db.query(query, function (error, rows) {

            // report error and return if error state
            if (error) return exports.access.handleError (query, error);

            // call the callback with data
            if (returnSingle) callback(rows[0]);
            else callback (rows);

        });

        this.close();

    }

};