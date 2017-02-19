var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var userAPI = require("./server/controllers/userAPI.js");
var SaloonAPI = require("./server/controllers/saloonAPI.js");
var appointmentAPI = require("./server/controllers/appointmentAPI.js");
var smsAPI = require("./server/controllers/smsAPI.js");
var config = require('./config/dev');
var Message = require('./server/models/Message');
var request = require('request');

var User = require('./server/models/User');
var nodemailer = require("nodemailer");
var baseURL = config.springedge.baseURL;

var mail_details = {
    service: config.mailer.service,
    auth: {
        "user": config.mailer.auth.user,
        "pass": config.mailer.auth.pass
    }
}
var smtpTransport = nodemailer.createTransport(mail_details);
console.log("here @@@@@")


app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded

app.use(bodyParser.json());
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,x-username,x-token');
    next();
};
app.use(allowCrossDomain);

//connect mongo
mongoose.connect('mongodb://localhost:27017/saloonapp');

app.use(bodyParser());

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client/views/index.html');
})

app.use("/js", express.static(__dirname + '/client/js'));

app.post('/api/registerUser',userAPI.createUser);
app.post('/api/getLogin',userAPI.loginToApp);
app.get('/api/listOfUser',userAPI.listOfUser);
app.post('/api/addToCart',userAPI.addToCart);
app.post('/api/updateProfile',userAPI.updateProfile);

app.post('/api/addBusiness',SaloonAPI.addSaloonBusiness);
app.post('/api/getBusiness',SaloonAPI.getSaloonBusiness);
app.post('/api/getBusinessById',SaloonAPI.getBusinessById);


app.post('/api/getSaloons',SaloonAPI.getAllSaloons);
app.post('/api/getServicesBySaloonId',SaloonAPI.getServicesBySaloonId);
app.post('/api/deleteSaloon',SaloonAPI.deleteSaloon);
app.post('/api/updateSaloon',SaloonAPI.updateSaloon);


app.post('/api/bookAppointment', appointmentAPI.bookAppointment);
app.post('/api/getBookingList', appointmentAPI.getBookingList);
app.post('/api/updateBooking', appointmentAPI.updateBooking);
app.post('/api/getUserDetailsByMobile', appointmentAPI.getUserDetailsByMobile);
app.post('/api/customerOrdersReporttest',appointmentAPI.customerOrdersReporttest);
app.post('/api/customerOrdersReport',appointmentAPI.customerOrdersReport);
app.post('/api/customerChurnAppointmentReport',appointmentAPI.customerChurnOrderReport);
app.post('/api/uniqueUserByBusiness',appointmentAPI.uniqueappointments);
app.post('/api/totalAggregatedAmount',appointmentAPI.totalAggregatedAmount);




//app.post('/api/sendSmsToCustomers',smsAPI.sendSmsToCustomers);

app.post('/api/sendSmsToCustomers', function (req, res) {
    //console.log('calling sendsmstosuctomers api ');

    var mailOptions = {
        to: req.body.email
    };
    if(req.body.appointmentStatus !='NEW'){
        mailOptions.subject = "Booking Finished TnY";
        mailOptions.text = "Thank you for booking with us. your booking has been Completed.\n\n" +
            "Salon Name: " + req.body.SaloonName + "\n\n" +
            "Date: " + req.body.Date + '\n\n' +
            "Address: " + req.body.Address + '\n\n' +
            "Total Amount: " +'\u20B9'+ req.body.grandTotal + '\n\n' +
            "we are exited to serve you again " + '\n\n' +
            "Team TnY";
    }else {
        mailOptions.subject = "Booking Confirmed TnY";
        mailOptions.text = "Thank you for booking with us. your booking has been confirmed.\n\n" +
            "Salon Name: " + req.body.SaloonName + "\n\n" +
            "Date: " + req.body.Date + '\n\n' +
            "Address: " + req.body.Address + '\n\n' +
            "we are exited to serve you " + '\n\n' +
            "Team TnY";


    }
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            console.log("Mail not send");

        } else {
            console.log("timestamp : ", response);

        }
        var body = req.body;
        var number = body.recipientNumber;

        var appLinkMessage = {
            recipientName: body.recipientName,
            recipientNumber: body.recipientNumber,
            message: body.message,
            email: req.body.email,
            action: 'Link sent'
        };
        console.log("5");
        sendAppLink(appLinkMessage, function (err) {
            //console.log('sent to ' + number );
            console.log("11");

        });
    });
});


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

    console.log("7");
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

    console.log("8");
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
    console.log("6");
    sendPromotionalMessage(appLinkMessage.recipientNumber, appLinkMessage.message, function (output) {// smsCallBack
        //console.log('sendAppLink output--------------------',output);

        console.log("9");
        Message.create(appLinkMessage, function (err, createdMsg) {

            console.log("10");
            if (!err) {
                console.log('App link message created : ' + createdMsg);
            }
            cb(null, createdMsg);
        });

    });

}

module.exports = app;

app.listen(5000, function () {
    console.log("Welcome to SaloonApp.. server started at 5000")
})

