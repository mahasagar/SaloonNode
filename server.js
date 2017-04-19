var express = require("express");
var multer  =   require('multer');
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

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : storage}).single('userPhoto');



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




app.post('/api/getMessages',smsAPI.getMessages);
app.post('/api/sendSmsToCustomers',smsAPI.sendSmsToCustomers);
app.post('/api/photo',function(req,res){
    upload(req,res,function(err,result) {
        if(err) {
            console.log(err)
            return res.end("Error uploading file.");
        }
        console.log("req : "+result);
        res.end(result);
    });
});
/*
app.post('/sendsmstosuctomers', function (req, res) {
    //console.log('calling sendsmstosuctomers api ');
    console.log('calling sendsmstosuctomers req.body', req.body);
    var mailOptions = {
        to: req.body.email, // list of receivers
        subject: "testing mail", // Subject line
        text: "welcome"
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

}*/

module.exports = app;

app.listen(5000, function () {
    console.log("Welcome to SaloonApp.. server started at 5000")
})

