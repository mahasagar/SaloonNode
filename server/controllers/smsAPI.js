/**
 * Created by mahasagar on 10/1/17.
 */
var User = require('../models/User');
var request = require('request');
var nodemailer = require("nodemailer");
var config = require('../../config/dev');
var baseURL = config.springedge.baseURL;
var Message = require('../models/Message');

var mail_details = {
    service: config.mailer.service,
    auth: {
        "user": config.mailer.auth.user,
        "pass": config.mailer.auth.pass
    }
}
var smtpTransport = nodemailer.createTransport(mail_details);

function sendsmstosuctomers(req,res){
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
};


function getSMSQuery() {
    var queryString = {
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


module.exports.sendsmstosuctomers = sendsmstosuctomers;
