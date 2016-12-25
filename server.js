var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    userAPI = require("./server/controllers/userAPI.js"),
    SaloonAPI = require("./server/controllers/saloonAPI.js"),
    orderAPI = require("./server/controllers/orderAPI.js");

//connect mongo
mongoose.connect('mongodb://localhost:27017/saloonapp');

app.use(bodyParser());

app.get('/',function(req,res){
 res.sendfile(__dirname+'/client/views/index.html');
})

app.use("/js",express.static(__dirname+'/client/js'));

app.post('/api/registerUser',userAPI.createUser);
app.post('/api/getLogin',userAPI.loginToApp);
app.get('/api/listOfUser',userAPI.listOfUser);

app.post('/api/addBusiness',SaloonAPI.addSaloonBusiness);
app.get('/api/getBusiness',SaloonAPI.getSaloonBusiness);

app.post('/api/placeOrder',orderAPI.placeOrder);
app.get('/api/getAllOrders',orderAPI.getAllOrders);

module.exports = app;

app.listen(5000,function(){
 console.log("Welcome to SaloonApp..")
})

