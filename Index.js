/**
 * Created by SW on 29/06/2015.
 */
var express = require('express');
var http_server;
var app = express();
var fs = require('fs'); //for reading the certificate files
var port_number = 9005;
var routes = require('./Router/router')(app);
var credentials ={
    pfx: fs.readFileSync('AmeetsCerts/TimeTracker wilcard.pfx'),
    passphrase : "P@yEv0"};

var mongoConfigs = require('./DB/mongoconfig');
var database = mongoConfigs.getDBobject();
var databaseAutho = mongoConfigs.getDBobject();

//The switch statement checks to see if the environment variable indicates "production"
switch (app.settings.env) {
    case 'production':
        //var privateKey  = fs.readFileSync('SSL_cert/peserver.key', 'utf8');
        //var certificate = fs.readFileSync('SSL_cert/peserver.crt', 'utf8');
        //var credentials = {key: privateKey, cert: certificate};

        console.log("Production mode");
        http_server = require('https').createServer(credentials, app);

        break;
    default:
        console.log("Development mode");
        //http_server = require('http').createServer( app);
        http_server = require('https').createServer(credentials, app);
}

process.on( 'SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    // some other closing procedures go here
    process.exit();
})

http_server.listen(port_number, function() {
    console.log('server started port: ' + port_number);
});

// Test mongBD

console.log('TokenTB = : ' +  mongoConfigs.qDisplayTokenTable() );
 
