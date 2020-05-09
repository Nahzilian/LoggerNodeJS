/**
 * Created by Sriyan on 20/10/2015.
 */
var mongo = require("mongodb");
var date = require("datejs");
var MongoClient = mongo.MongoClient;
var MongoClientBeta = mongo.MongoClient;
var MongoClientDev = mongo.MongoClient;
var MongoClientProd = mongo.MongoClient;
var MongoClientStag = mongo.MongoClient;
var MongoAuthoClient = mongo.MongoClient;
var MongoErrorClient = mongo.MongoClient;
var MongoErrorClientBeta = mongo.MongoClient;
var MongoErrorClientDev = mongo.MongoClient;
var MongoErrorClientProd = mongo.MongoClient;
var MongoErrorClientStag = mongo.MongoClient;
var MongoEventClient = mongo.MongoClient;

var name = "PELogger"
var nameBeta = "PELogger_Beta"
var nameDev = "PELogger_Dev"
var nameProd = "PELogger_Prod"
var nameStag = "PELogger_Stag"
var nameAuth = "Authorization"
var nameErrors = "ErrorLogDB"
var nameErrorsBeta = "ErrorLogDB_Beta"
var nameErrorsDev = "ErrorLogDB_Dev"
var nameErrorsProd = "ErrorLogDB_Prod"
var nameErrorsStag = "ErrorLogDB_Stag"
var nameEvent = "EventDB"

var database = null;
var databaseBeta = null;
var databaseDev = null;
var databaseProd = null;
var databaseStag = null;
var databaseAutho = null;
var databaseError = null;
var databaseErrorBeta = null;
var databaseErrorDev = null;
var databaseErrorProd = null;
var databaseErrorStag = null;
var databaseEvent = null;

var logsTable = null;
var logsTableBeta = null;
var logsTableDev = null;
var logsTableProd = null;
var logsTableStag = null;
var tokenTable = null;
var errorTable = null;
var errorTableBeta = null;
var errorTableDev = null;
var errorTableProd = null;
var errorTableStag = null;
var eventTable = null;
 

var url = 'mongodb://localhost:27017/';
var appName = null;
var logEnvironment = null; // use  this to decide  errorEnvironment //it is paired no need another var

var saltKey = null;

MongoAuthoClient.connect(url + nameAuth, {auto_reconnect: true}, function (err, dbautho) {
        if (err){
                throw err;
        }
        databaseAutho = dbautho;
        tokenTable = dbautho.collection("tokenTable");
      
        dbautho.collection("saltTable").find().limit(1).next(function(err, result){
                if (err) throw err;
                saltKey = result.saltstring;
                console.log(" saltTable saltstring: " + saltKey);
               // dbautho.close();    
            });

        console.log("Authorization::tokenTable Connected");
    });

MongoClient.connect(url + name, {auto_reconnect: true}, function (err, db) {
        if (err){
                throw err;
        }
        database = db;
        logsTable = db.collection("logsTable");
        console.log("PELogger DB =" + name +"::logsTable Connected");
});
MongoClientBeta.connect(url + nameBeta, {auto_reconnect: true}, function (err, db) {
        if (err){
                throw err;
        }
        databaseBeta = db;
        logsTableBeta = db.collection("logsTable");
        console.log("PELogger DB =" + nameBeta +"::logsTable Connected");
});
MongoClientDev.connect(url + nameDev, {auto_reconnect: true}, function (err, db) {
        if (err){
                throw err;
        }
        databaseDev = db;
        logsTableDev = db.collection("logsTable");
        console.log("PELogger DB =" + nameDev +"::logsTable Connected");
});
MongoClientProd.connect(url + nameProd, {auto_reconnect: true}, function (err, db) {
        if (err){
                throw err;
        }
        databaseProd = db;
        logsTableProd = db.collection("logsTable");
        console.log("PELogger DB =" + nameProd +"::logsTable Connected");
});
MongoClientStag.connect(url + nameStag, {auto_reconnect: true}, function (err, db) {
        if (err){
                throw err;
        }
        databaseStag = db;
        logsTableStag = db.collection("logsTable");
        console.log("PELogger DB =" + nameStag +"::logsTable Connected");
});

MongoErrorClient.connect(url + nameErrors, {auto_reconnect: true}, function (err, dberror) {
        if (err){
                throw err;
        }
        databaseError = dberror;
        errorTable = dberror.collection("errorTable");
        console.log("ErrorLogDB::errorTable Connected");
});
MongoErrorClientBeta.connect(url + nameErrorsBeta, {auto_reconnect: true}, function (err, dberror) {
        if (err){
                throw err;
        }
        databaseErrorBeta = dberror;
        errorTableBeta = dberror.collection("errorTable");
        console.log(  nameErrorsBeta + " Connected");
});
MongoErrorClientDev.connect(url + nameErrorsDev, {auto_reconnect: true}, function (err, dberror) {
        if (err){
                throw err;
        }
        databaseErrorDev = dberror;
        errorTableDev = dberror.collection("errorTable");
        console.log(  nameErrorsDev + " Connected");
});
MongoErrorClientProd.connect(url + nameErrorsProd, {auto_reconnect: true}, function (err, dberror) {
        if (err){
                throw err;
        }
        databaseErrorProd = dberror;
        errorTableProd = dberror.collection("errorTable");
        console.log( nameErrorsProd + " Connected");
});
MongoErrorClientStag.connect(url + nameErrorsStag, {auto_reconnect: true}, function (err, dberror) {
        if (err){
                throw err;
        }
        databaseErrorStag = dberror;
        errorTableStag = dberror.collection("errorTable");
        console.log( nameErrorsStag +" Connected");
});

MongoEventClient.connect(url + nameEvent, {auto_reconnect: true}, function (err, dbev) {
        if (err){
                throw err;
        }
        databaseEvent = dbev;
        eventTable = dbev.collection("eventTable");
        console.log( nameEvent +" Connected");
});
//When the server shuts downs run the following code
process.on( 'SIGINT', function() {
        console.log( "\nShutting down DB" );
        database.close();
        process.exit();
})
//The following functions return the mongodb collections
// function getOurErrorTable()
// {
//         return ourErrorTable;
// }
// module.exports.getOurErrorTable = getOurErrorTable;

function getDBobject()
{
        return database;
}
function getDBobjectAutho()
{
        return databaseAutho;
}
module.exports.getDBobject = getDBobject;

function getLogTable()
{
        return logsTable;
}
module.exports.getLogTable = getLogTable;
function getLogTableBeta()
{
        return logsTableBeta;
}
module.exports.getLogTableBeta = getLogTableBeta;
function getLogTableDev()
{
        return logsTableDev;
}
module.exports.getLogTableDev = getLogTableDev;
function getLogTableProd()
{
        return logsTableProd;
}
module.exports.getLogTableProd = getLogTableProd;
function getLogTableStag()
{
        return logsTableStag;
}
module.exports.getLogTableStag = getLogTableStag;

function getErrorTable()
{
        return errorTable;
}
module.exports.getErrorTable = getErrorTable;
function getErrorTableBeta()
{
        return errorTableBeta;
}
module.exports.getErrorTableBeta = getErrorTableBeta;
function getErrorTableDev()
{
        return errorTableDev;
}
module.exports.getErrorTableDev = getErrorTableDev;
function getErrorTableProd()
{
        return errorTableProd;
}
module.exports.getErrorTableProd = getErrorTableProd;
function getErrorTableStag()
{
        return errorTableStag;
}
module.exports.getErrorTableStag = getErrorTableStag;
function getEventTable()
{
        return eventTable;
}
module.exports.getEventTable = getEventTable;
function getTokenTable()
{
        return tokenTable;
}
module.exports.getTokenTable = getTokenTable;

function getAppName()
{
        return appName;
}
module.exports.getAppName = getAppName;

function getSaltKey()
{
        return saltKey;
}
module.exports.getSaltKey = getSaltKey;



function qDisplayTokenTable()
{
        MongoAuthoClient.connect(url + nameAuth, {auto_reconnect: true}, function (err, dbautho) {
            if (err){
                     throw err;
            }
            
            dbautho.collection("tokenTable").find().count(function(err, result){
                if (err) throw err;
                console.log(" tokenTable Record Count: " + result);
                dbautho.close();    
            });
        });
        return "OK";
}
module.exports.qDisplayTokenTable = qDisplayTokenTable;
 
