var express = require('express');
var router = express.Router();
var logManager = require("./log-manager.js");

router.put('/create/:logLevel/:time/:logMessage', logManager.createLog)

router.get('/get/:logId', logManager.getLog)

router.get('/getall', logManager.getAllLogs)

router.delete('/delete/:logId', logManager.deleteLog)

module.exports = router;
