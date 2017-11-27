var moment = require('moment');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "nodejs_database_host",
    user: "root",
    password: "toor",
    database: "article_repository"
});

var createLogTableSql = "CREATE TABLE IF NOT EXISTS logs (\
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
        date    DATETIME NOT NULL,\
        logLevel TINYINT UNSIGNED NOT NULL,\
        logMessage VARCHAR(500));";

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to databse!");
    con.query(createLogTableSql, function(err, result) {
        if (err) throw err;
        console.log("Table 'logs' created if it didn't exist before...");
    });
});

//https://stackoverflow.com/questions/22164541/validating-a-iso-8601-date-using-moment-js
function isDateValid(date) {
    return moment(date, "YYYY-MM-DDTHH:mm:ss", false).isValid();
}

function isLogLevelValid(logLevel) {
    return (logLevel >= 0 && logLevel <= 3);
}

exports.deleteLog = function(req, res) {
    var logId = req.params.logId;
    con.query("DELETE FROM logs WHERE id = ?", [logId],
        function(err, result) {
            if (err) {
                console.log('this.sql', this.sql)
                throw err;
            }
            console.log("Log with id '" + logId + "' successfully deleted!");
            res.send({
                "id": logId
            });
        });
}

exports.getLog = function(req, res) {
    var logId = req.params.logId;
    con.query("SELECT * FROM logs WHERE id = ?", [logId],
        function(err, result) {
            if (err) {
                console.log('this.sql', this.sql)
                throw err;
            }
            console.log("Log obtained from database successfully!");
            res.send(result);
        });
}

exports.getAllLogs = function(req, res) {
    con.query("SELECT * FROM logs",
        function(err, result) {
            if (err) {
                console.log('this.sql', this.sql)
                throw err;
            }
            console.log("All logs obtained from database successfully!");
            res.send(result);
        });
}

exports.createLog = function(req, res) {
    if (isDateValid(req.params.time)) {
        var time = moment(req.params.time, "YYYY-MM-DDTHH:mm:ss", false);
    } else {
        res.send({
            "error": "Date '" + req.params.time + "' is not valid ISO 8601 format!"
        });
        return;
    }
    if (isLogLevelValid(req.params.logLevel)) {
        var logLevel = req.params.logLevel;
    } else {
        res.send({
            "error": "Log level must be between 0 and 3!"
        });
        return;
    }
    if (req.params.logMessage.length < 500) {
        var logMessage = req.params.logMessage;
    } else {
        res.send({
            "error": "Message must be shorter than 500 symbols!"
        });
        return;
    }
    con.query("INSERT INTO logs (date, logLevel, logMessage) VALUES (?)", [
            [time.utc().format('YYYY-MM-DD HH:mm:ss'), logLevel, logMessage]
        ],
        function(err, result) {
            if (err) {
                console.log('this.sql', this.sql)
                throw err;
            }
            console.log("Log added successfully with id " + result.insertId);
            res.send({
                "id": result.insertId
            });
        });
};
