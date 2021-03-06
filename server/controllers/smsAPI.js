/**
 * Created by mahasagar on 10/1/17.
 */
var User = require('../models/User');
var request = require('request');
var nodemailer = require("nodemailer");
var config = require('../../config/dev');
var baseURL = config.springedge.baseURL;
var Message = require('../models/Message');

/*var mail_details = {
    service: config.mailer.service,
    auth: {
        "user": config.mailer.auth.user,
        "pass": config.mailer.auth.pass
    }
}*/
var mail_details = {
    from: config.mailer.auth.user
}

var smtpTransport = nodemailer.createTransport("SMTP",config.newMailer);
//var smtpTransport = nodemailer.createTransport(mail_details);

function getMessages(req, res) {
    console.log('req.body -------================',req.body);
    Message.find(req.body, function (err, result) {
        if (!err) {
            res.json(result);
        }else{
            res.json({result : null});
        }
    });
}

function sendSmsToCustomers(req,res){
    console.log('calling sendSmsToCustomers req.body', req.body);
    var mailOptions = {
        to: req.body.email
    };
    if(req.body.appointmentStatus =='NEW'){
        mailOptions.subject = "Booking Confirmed TnY";
        mailOptions.text = "Thank you for booking with us. your booking has been confirmed.\n\n" +
            "Salon Name: " + req.body.SaloonName + "\n\n" +
            "Date: " + req.body.Date + '\n\n' +
            "Address: " + req.body.Address + '\n\n' +
            "we are exited to serve you " + '\n\n' +
            "Team TnY";
    }else {
        mailOptions.subject = "Booking Finished TnY";
        mailOptions.text = "Thank you for booking with us. your booking has been Completed.\n\n" +
            "Salon Name: " + req.body.SaloonName + "\n\n" +
            "Date: " + req.body.Date + '\n\n' +
            "Address: " + req.body.Address + '\n\n' +
            "Total Amount: " +'\u20B9'+ req.body.grandTotal + '\n\n' +
            "we are exited to serve you again " + '\n\n' +
            "Team TnY";

    }
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            console.log("Mail not send");

        } else {
            console.log("timestamp : ", response);

        }
    });
    var sentNums = {};
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
    res.json({result : true});
};


function getSMSQuery() {
    var queryString = {
        apikey: config.springedge.key,
        sender: 'TNYGSF',
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
    console.log('sendPromotionalMessage queryParams',queryParams);

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
    console.log('appLinkMessage---------================',appLinkMessage);
    sendPromotionalMessage(appLinkMessage.recipientNumber, appLinkMessage.message, function (output) {// smsCallBack
        //console.log('sendAppLink output--------------------',output);
        Message.create(appLinkMessage, function (err, createdMsg) {
            if (!err) {
                console.log('App link message created : ' + createdMsg);
            }
            cb(null, createdMsg);
        });

    });

}



module.exports.sendSmsToCustomers = sendSmsToCustomers;
module.exports.getMessages = getMessages;
