/**
* Created by sriyanw on 15-07-09.
*/
var bearer = require("passport-http-bearer");
var BearerStrategy = require('passport-http-bearer').Strategy;
//var passport = require('passport');
//export the passport to be used by the router
//module.exports.passport = passport;
//DB connection
var mongo = require('../DB/mongoconfig');
//Token generation
var jwt = require('jwt-simple');
var secret = "PEvolution345";
var tokenTable = mongo.getTokenTable();

function checkAPIKey(req, res, next)
{
    console.log("checkAPIKey() start ");
    var token = req.headers["authorization"];
   // var token = req.query.apikey || req.headers.apikey || "";
    console.log("token = " + token);
    mongo.getTokenTable().find({token:token}).limit(1).next(function(err, doc){
        if(err || !doc)
        {
            setTimeout(function() {
                res.status(401).send();
            }, 5000);
            return;
        }
        else(doc)
        {
            req.doc = doc;
            mongo.appName = doc.app_name; 
            mongo.logEnvironment = doc.environment;
            console.log("logEnvironment = " + mongo.logEnvironment); 
            next();
        }
    });
}
module.exports.checkAPIKey = checkAPIKey;





