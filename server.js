var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var userAPI = require("./server/controllers/userAPI.js");
var SaloonAPI = require("./server/controllers/saloonAPI.js");
var orderAPI = require("./server/controllers/orderAPI.js");
var config = require('./config/dev');
var baseURL = config.springedge.baseURL;
var Message = require('./server/models/Message');
var request = require('request');
var nodemailer = require("nodemailer");
var mail_details = {
    service: config.mailer.service,
    auth: {
        "user": config.mailer.auth.user,
        "pass": config.mailer.auth.pass
    }
}
var smtpTransport = nodemailer.createTransport(mail_details);
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded

app.use(bodyParser.json());

//connect mongo
mongoose.connect('mongodb://localhost:27017/saloonapp');

app.use(bodyParser());

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client/views/index.html');
})

app.use("/js", express.static(__dirname + '/client/js'));

app.post('/api/createUser', userAPI.createUser);
app.post('/api/getLogin', userAPI.loginToApp);
app.get('/api/listOfUser', userAPI.listOfUser);

app.post('/api/addBusiness', SaloonAPI.addSaloonBusiness);
app.get('/api/getBusiness', SaloonAPI.getSaloonBusiness);

app.post('/api/placeOrder', orderAPI.placeOrder);
app.get('/api/getAllOrders', orderAPI.getAllOrders);


app.post('/sendsmstosuctomers', function (req, res) {
    //console.log('calling sendsmstosuctomers api ');
    console.log('calling sendsmstosuctomers req.body', req.body);
    var mailOptions = {
        to: req.body.email, // list of receivers
        subject: "testing mail", // Subject line
        text: "welcome"
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            console.log("Mail not send");

        } else {
            console.log("timestamp : ", response);

        }
    });
    //var sentNums = {};
    var body = req.body;
    var number = body.recipientNumber;

    var appLinkMessage = {
        recipientName: body.recipientName,
        recipientNumber: body.recipientNumber,
        message: body.message,
        email: req.body.email,
        action: 'Link sent'
    };
    console.log('sending app link to : ' + JSON.stringify(number));
    sendAppLink(appLinkMessage, function (err) {
        //console.log('sent to ' + number );
    });
});


function getSMSQuery() {
    var queryString = {
        apikey: config.springedge.key,
        sender: 'SEDEMO',
        to: 'messageNumbers',
        message: 'messageText',
        format: 'json',
    };

    var queryParams = JSON.stringify(queryString);
    queryParams = queryParams.replace(/{/g, '');
    queryParams = queryParams.replace(/}/g, '');
    queryParams = queryParams.replace(/:/g, '=');
    queryParams = queryParams.replace(/,/g, '&');
    queryParams = queryParams.replace(/"/g, '');

    return queryParams;
}

function sendPromotionalMessage(number, message, callback) {
    //console.log('sendPromotionalMessage number',number);
    //console.log('sendPromotionalMessage message',message);
    var queryParams = getSMSQuery();
    message = encodeURIComponent(message);
    queryParams = queryParams.replace('messageText', message);
    queryParams = queryParams.replace('messageNumbers', number);
    //console.log('sendPromotionalMessage queryParams',queryParams);

    sendRequest(baseURL + queryParams, number, callback);
}


function sendRequest(uri, number, callback) {
    console.log('uri', uri);
    console.log('number', number);
    request(
        {
            method: 'GET',
            uri: uri
        },
        function (error, response, body) {
            var tempvar = true;
            // console.log('sendRequest error',error);
            //console.log('sendRequest response',response.statusCode);
            // console.log('body error',body);
            var output = {};
            var parsedBody = JSON.parse(body);
            console.log('parsedBody', parsedBody);
            callback(parsedBody)

        }
    );
}


function sendAppLink(appLinkMessage, cb) {
    //console.log('appLinkMessage---------================',appLinkMessage);
    sendPromotionalMessage(appLinkMessage.recipientNumber, appLinkMessage.message, function (output) {// smsCallBack
        //console.log('sendAppLink output--------------------',output);
        Message.create(appLinkMessage, function (err, createdMsg) {
            if (!err) {
                console.log('App link message created : ' + createdMsg);
            }
        });
        cb(null, output);
    });

}

module.exports = app;

app.listen(5000, function () {
    console.log("Welcome to SaloonApp.. server started at 5000")
})

