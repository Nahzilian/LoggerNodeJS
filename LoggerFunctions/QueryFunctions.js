/**
 * Created by sriyan on 5/26/2016; Updated by Shaun Oct 5, 2017
 */

var mongo = require('../DB/mongoconfig');
crypto = require('crypto');
//var crypto = require("crypto")


function query(req, res, next)
{ 
    if(req.query.type =="error")
    {
        doQueryOnErrorTB(req,res);
     }
    else if(req.query.type =="log")
    {
        doQueryOnLogsTB(req,res);
    }
    else
    {
        return res.status(400).send("No query variables provided");
    }
}
module.exports.query = query;

// Query - SELECT or find() docs from logsTable
function doQueryOnLogsTB(req,res){
    var query = createQueryObject(req);
    var limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) <= 5000 ?
                parseInt(req.query.limit) : 5000;
    // var userEnvr =  mongo.logEnvironment;
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
    
    queriTB.find(query, {limit:limit}).toArray(function(err, docs){
        if(err)
        {
            return res.status(500).send("Server Error");
        }
        else if(docs)
        {
           // var wholeO = JSON.stringify(docs)
            //console.log('wholeO len ' + wholeO.length);
            //console.log('docs len ' + docs.length);
            var sk =  mongo.getSaltKey();
        
            for (var i=0; i<docs.length; i++){
                
                if(!(docs[i].orig_object==null || docs[i].orig_object=="null")){
             
                    console.log('docs[i] = ' + docs[i].orig_object);
                    docs[i].orig_object = decrypt( docs[i].orig_object, sk);
                }

          if(!(docs[i].new_object==null || docs[i].new_object=="null")){
               
                    //var De_object = decrypt( docs[i].orig_object, sk);
                    docs[i].new_object = decrypt( docs[i].new_object, sk);
                }
            }


            console.log('Received Log query:: docs');
            console.log('Docs:DATASEWID %j', docs);
            return res.status(200).json(docs)
        }
        else
        {
            return res.status(204).send();
        }
    });
}

// Query - SELECT or find() docs from errorTable
function doQueryOnErrorTB(req,res){
    console.log('Query errorTable...');
    var query = createQueryObject(req);
    var limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) <= 5000 ?
                parseInt(req.query.limit) : 5000;
    var queriTB =null;
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
                
    queriTB.find(query, {limit:limit}).toArray(function(err, docs){
        if(err)
        {
            return res.status(500).send("Server Error");
        }
        else if(docs)
        {
            console.log('Docs:Err Found = %j', docs);
            return res.status(200).json(docs)
        }
        else
        {
            return res.status(204).send();
        }
    });
}

//This will take the query and assemble it to be used in a find() statement
function createQueryObject(req)
{
    var o = req.query;
    var result = {};

    // if(o.event_id)
    // {
    //     result.event_id = o.event_id;
    // }
    if(o.event_type)
    {
        result.event_type = o.event_type;
    }
    if(o.table_name)
    {
        result.table_name = hashString(o.table_name);
    }
    if(o.object_id)
    {
        result.object_id = hashString(o.object_id);
    }
    
    if(o.function)
    {
        result.function = o.function;
    }

    if(o.description)
    {
        result.description = o.description;
    }
    else if(o.anydesc){
        
        result.description = RegExp(o.anydesc);
    }

    if(o.company_id)
    {
        result.company_id = hashString(o.company_id);
    }
    if(o.user_id)
    {
        result.user_id = o.user_id;
    }
    // if(o.time && !isNaN(o.time))
    // {
    //     result.time = parseInt(o.time);
    // }
    if(o.client_ip)
    {
        result.client_ip = o.client_ip;
    }

    if(o.message)
    {
        result.message = o.message;
    }
    else if(o.anymsg)
    {
        result.message = RegExp(o.anymsg);
    }

    if(o.any)
    {
        
        var srch = '$search'
        var searchdummy = {}
        searchdummy [srch] = RegExp(o.any)
        
        var ntxt ='$text'
        var resultdummy = {}
        result[ntxt] = searchdummy
        
        //result = resultdummy;
        
        //result = JSON.stringify(resultdummy);
                
                      //  result = "{$text: { $search: " + RegExp(o.any) + "}}" ; 
                              //result.company_id = o.any;

    }

    //Check if there is a time bound and add it to the query object
    if(req.query.start_time && !isNaN(req.query.start_time) && req.query.end_time && !isNaN(req.query.end_time))
    {
        timeBoundQuery(req, result);
    }

    console.log('result = %j', result);

    return result;
}

//This is used to apply a time bound
function timeBoundQuery(req,query)
{
  
    console.log('I got bound' + req.query.start_time);

    query.created = {$gte:parseInt(req.query.start_time),$lte:parseInt(req.query.end_time)};
}

//This function is used to double hash the data
function hashString(data)
{
    var sha256Hash = crypto.createHash('sha256');
    sha256Hash.update(data, 'utf8');
    var hash = sha256Hash.digest('hex');

    sha256Hash = crypto.createHash('sha256');
    sha256Hash.update(hash, 'hex');
    hash = sha256Hash.digest('hex');

    return hash;
}


function decrypt( data, key) {
//     console.log('data = ' + data );
//     console.log('key = ' + key );

//     var decipher = crypto.createDecipher('aes-256-cbc', key);
//     decipher.setAutoPadding(false);
//     var decrypted = decipher.update(data, 'hex', 'utf-8');
//     decrypted += decipher.final('utf-8');
//   //  decrypted = Buffer.concat([decrypted, decipher.final()]);

  
//     // var decrypt = crypto.createDecipheriv('des-ede3', key, "");
//     // decrypt.setAutoPadding(false);
//     // var s = decrypt.update(data, 'base64', 'utf8');
//     // var decrypted= s + decrypt.final('utf8');
//     return decrypted.toString();
////////////////////////////////////////

let textParts = data.split(':');
let iv = new Buffer(textParts.shift(), 'hex');
let encryptedText = new Buffer(textParts.join(':'), 'hex');
let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encryptedText);

decrypted = Buffer.concat([decrypted, decipher.final()]);

return decrypted.toString();
}