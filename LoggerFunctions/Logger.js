/**
 * Updated Oct 26 2017
 * https://github.com/ptarjan/node-cache
 * Part of https://github.com/chris-rock/node-crypto-examples
 * Created by BTC on 08/01/2016.
 */
var crypto = require("crypto")
var cache = require('memory-cache');
var mongo = require('../DB/mongoconfig');
var logTable = mongo.getLogTable();
var errorTable = mongo.getErrorTable();
//var ourErrorTable = mongo.getOurErrorTable();
var ObjectId = require('mongodb').ObjectID;

function logFilter(req, res, next)
{
   // var type = req.body.type || req.query.type || "no type";
   var type = req.query.type || "no type";

    if(type == 'log')
    {
        console.log(getDateTime() + '# Received LogLOG Request');
        
        //logData(req, res, next);
        // console.log('Received Log Request: Set TimeOut 30s for test Async ');
        // setTimeout(function() {
        //     logData(req, res, next);
        //     console.log('30 s Passed & LogData Done');
        // }, 30000);

        logData(req, res, next);

    }
    else if(type == 'error')
    {
        console.log(getDateTime() + 'Received LogERR Request');
        //logError(req, res, next);

        if (cache.keys().length > 0)
        {
            console.log('Cache exists => Search for Err use all fields now (compnay_id&&...): Need upgrade after for minimize memory');
            var data = req.body || {};
                        
            var err_dummy ={};
            err_dummy.company_id = data.company_id;
            err_dummy.message = data.message;
            err_dummy.company_path = data.company_path;
            err_dummy.path_name = data.path_name;
            err_dummy.inner = data.inner;
            
            var BreakException = {};
            try {
                var c = 0;
                cache.keys().forEach(function(key) {
                    if (JSON.stringify(cache.get(key)) === JSON.stringify(err_dummy) ) {
                        console.log('Found Err in Cache key=[_id] = ' + key + ' =>Use to Update [errorTB]' );
                        updateError_CountUp(key, res, next);
                        c = c+1;
                        throw BreakException;
                    }
                });
             
                if ( c < 1) {
                console.log('Found no Err in cahce => Insert a new Err');
                logError(req, res, next);
               }
                

            } catch (e) {
                if (e !== BreakException){
                    updateError_CountUp(key, res, next);
                    throw e;
                } 
            }

        }else{
            console.log('No Cache exists => Insert a new Err');
            logError(req, res, next);

        }

        
    }
    else
    {
        res.status(400).send("Type not specified");
    }
}
module.exports.logFilter = logFilter;


function logData(req, res, next)
{
    var data = req.body || {};
   // data.app_name = req.app_name || req.doc.app ||  "no_name";
   // data.action = req.body.action || "Empty";g q
  // console.log('need encrypt with key = ' + mongo.getSaltKey() );
  var sk =  mongo.getSaltKey();
  if(!(data.orig_object==null || data.orig_object=="null")){
    var encryptedText = encrypt( data.orig_object, sk);
    data.orig_object = encryptedText;
   // var decryptedText = decrypt(encryptedText,sk);
  //  console.log('decryptedText Orig= ' + decryptedText );
    }

  if(!(data.new_object==null || data.new_object=="null")){
    var encryptedText = encrypt( data.new_object, sk);
    data.new_object = encryptedText;

   // var decryptedText = decrypt(encryptedText,sk);
  //  console.log('decryptedText New = ' + decryptedText );

    }

    data.created = parseInt(Date.now()/1000);
  
  
    //data.nodesideip = req.ip || req.ips || req.connection.remoteAddress || "0.0.0.0";
    
    var _clientIP=req.ip || req.ips || req.connection.remoteAddress || "0.0.0.0";
    var n = _clientIP.lastIndexOf(":");
    data.client_ip = _clientIP.substring(n + 1);

    console.log('data.client_ip ' + data.client_ip);
 
 
    data.app_name = mongo.appName;
    
    var queriTB =null;
    switch( mongo.logEnvironment )
    {
    case "PELogger_Beta":
    queriTB = mongo.getLogTableBeta();
    break;

    case "PELogger_Dev":
    queriTB = mongo.getLogTableDev();
    break;
    
    case "PELogger_Prod":
    queriTB = mongo.getLogTableProd();
    break;
    
    case "PELogger":
    queriTB = mongo.getLogTable();
    break;
    
    default:
    queriTB = mongo.getLogTableStag();
    
    }
    
    queriTB.insertOne(data, function(err, r){
        if(err || !r)
        {
            res.status(500).send();
            return;
        }
        else
        {
            res.status(200).send();
        }
    });
}
module.exports.logData = logData;


function logError(req, res, next)
{
    var data = req.body || {};
    data.app_name = mongo.appName
    data.created = parseInt(Date.now()/1000);
    //data.ip = req.ip || req.ips || req.connection.remoteAddress || "0.0.0.0";
    var _clientIP=req.ip || req.ips || req.connection.remoteAddress || "0.0.0.0";
    var n = _clientIP.lastIndexOf(":");
    data.client_ip = _clientIP.substring(n + 1);

    console.log('data.client_ip ' + data.client_ip);
  
    data.count = 0;

    switch( mongo.logEnvironment )
    {
        case "PELogger_Beta":
        queriTB = mongo.getErrorTableBeta();
        break;
        
        case "PELogger_Dev":
        queriTB = mongo.getErrorTableDev();
        break;
                
        case "PELogger_Prod":
        queriTB = mongo.getErrorTableProd();
        break;
                
        case "PELogger":
        queriTB = mongo.getErrorTable();
        break;
                
        default:
        queriTB = mongo.getErrorTableStag();
    }

    mongo.getEventTable().findOne({event_message:data.message},function(err, evobj){
        data.event_id = "unknown";
        if(err)
        {
            throw err;
        }else if(evobj){
            data.event_id = evobj.event_id;
        }
        
        queriTB.insertOne(data, function(err, r){
            if(err || !r)
            {
                res.status(500).send();
                if(err)
                {
                    logOurError(err);
                }
                return;
            }
            else
            {
                var err_dummy ={};
                err_dummy.company_id = data.company_id;
                err_dummy.message = data.message;
                err_dummy.company_path = data.company_path;
                err_dummy.path_name = data.path_name;
                err_dummy.inner = data.inner;

                cache.put(r.insertedId, err_dummy,600000); // key is set = _id && 10 mins
                res.status(200).send();
            }
        });
    });
}
module.exports.logError = logError;

function updateError_CountUp(key, res, next)
{
    switch( mongo.logEnvironment )
    {
        case "PELogger_Beta":
        queriTB = mongo.getErrorTableBeta();
        break;
        
        case "PELogger_Dev":
        queriTB = mongo.getErrorTableDev();
        break;
                
        case "PELogger_Prod":
        queriTB = mongo.getErrorTableProd();
        break;
                
        case "PELogger":
        queriTB = mongo.getErrorTable();
        break;
                
        default:
        queriTB = mongo.getErrorTableStag();
    }

   // var query = { _id:key };
  var newvalues = {$inc: { count : 1 }};
 //  var query = { session: "session3" };

    queriTB.update( {_id: ObjectId(key)} , newvalues, function(err, output){
        if(err)
        { throw err;
        }else if(output){
            console.log('Found the err and updated ');
            res.status(200).send();
        }
    });
}
module.exports.updateError_CountUp = updateError_CountUp;

function logOurError(err)
{
    var obj = {}
    obj.err = err;
    obj.created = parseInt(Date.now()/1000);

    mongo.getOurErrorTable().insertOne(obj, function(err, r){
        return
    });
}
module.exports.logOurErrors = logOurError;

function insertErr(data)
{
    // var obj = {}
    // obj.err = err;
    // obj.created = parseInt(Date.now()/1000);

    // mongo.getOurErrorTable().insertOne(obj, function(err, r){
    //     return
    // });
    switch( mongo.logEnvironment )
    {
        case "PELogger_Beta":
        queriTB = mongo.getErrorTableBeta();
        break;
        
        case "PELogger_Dev":
        queriTB = mongo.getErrorTableDev();
        break;
                
        case "PELogger_Prod":
        queriTB = mongo.getErrorTableProd();
        break;
                
        case "PELogger":
        queriTB = mongo.getErrorTable();
        break;
                
        default:
        queriTB = mongo.getErrorTableStag();
                
    }
  
    queriTB.insertOne(data, function(err, r){
          if(err || !r)
          {
              res.status(500).send();
              if(err)
              {
                  logOurError(err);
              }
              return;
          }
          else
          {
              //console.log('Use this for Cache = ' , r.insertedId);
           //   err_dummy._id = r.insertedId;
              cache.put(r.insertedId, err_dummy,600000); // 10 mins
  
              res.status(200).send();
          }
      });
}
module.exports.insertErr = insertErr;

function getDateTime() {
    
        var date = new Date();
    
        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
    
        var min  = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        var sec  = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
    
        var year = date.getFullYear();
    
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
    
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
    
        return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    
    }

    function encrypt(data,key) {
    //     var cipher = crypto.createCipher('aes-256-cbc', key);
    //     var crypted = cipher.update(data, 'utf-8', 'hex');
    //     crypted += cipher.final('hex');
    //   //  console.log('data = ' + data );
    //    // console.log('key = ' + key );

    //     // var cipher = crypto.createCipheriv('des-ede3', key,"");
    //     // var crypted = encrypt.update(data, 'utf8', 'base64');
    //     // crypted += encrypt.final('base64');
      
    // return crypted;

    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data);
  
    encrypted = Buffer.concat([encrypted, cipher.final()]);
  
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

