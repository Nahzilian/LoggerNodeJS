/**
 * Created by sriyanw on 15-07-09.
 */
module.exports = function(app) {

    //These are the functiont to be used in the routes
    var testFN = require("../Tests/REST_Tests");
    var authFN = require("../Auth/authentication");
    var loggerFN = require("../LoggerFunctions/Logger");
    var queryFN = require("../LoggerFunctions/QueryFunctions");

    //Setting up Express with parsers and other middleware
    var bodyParser = require('body-parser');
    var cors = require('cors');
   // var passport = authFN.passport;
    app.use(cors());
    app.use(bodyParser.json());
    //app.use(multer()); // We don't need to use multi-part data yet
    app.disable('x-powered-by');
    //app.use(passport.initialize());

    app.get("/hello", testFN.hello);
    app.get("/test", authFN.checkAPIKey, testFN.hello);
    //app.get("/hello", authFN.checkAPIKey);

    app.post("/api/1.0/log", authFN.checkAPIKey, loggerFN.logFilter);
    app.get("/api/1.0/query",authFN.checkAPIKey, queryFN.query);
}