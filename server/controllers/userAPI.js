/**
 * Created by mahasagar on 20/12/16.
 */
var User = require('../models/User');
var Messages = require('../Utilities/messages');
var ObjectId = require('mongoose').Types.ObjectId;


function createUserAPI(req,res){
    var createUser = new User(req.body);
    var checkUsername = {
        'username' : req.body.auth.username
    }
    getUserByUsername(checkUsername,function(userExistsRes){
        if(userExistsRes.result == false) {
            createUser.save(function (err, result) {
                res.json({result : result,status : true});
            });
        }else{
            userExistsRes.status =false;
            res.json(userExistsRes);
        }
    });

}

function getUserByUsername(req,res){
    var loginDetail = {
        'auth.username' :req.username
    };
    User.findOne(loginDetail,function(req,results){
        if(results !== null) {
            res({result :Messages.usernameExists,status : true});
        }else{
            res({result :false,status : false});
        }
    })
}

function loginToApp(req,res){
    var loginDetail = {
        'auth.username' :req.body.username,
        'auth.password' : req.body.password
    };
    User.findOne(loginDetail,function(req,results){
        if(results !== null) {
            res.json({result :results,status : true});
        }else{
            res.json({result : Messages.userOrPasswordWrong,status : false});
        }
    })
}


function addToCart(req,res){
    var serviceData= req.body;
     User.findOne({_id : new ObjectId(serviceData.userId)},function(req,results){
        if(results && results.cart) {
            results.cart.push(serviceData);
        }else{
            results.cart = [];
            results.cart.push(serviceData);
        }
        var totalCount = results.cart.length;
        if(results !== null) {
            res.json({result : totalCount,status : true});
        }else{
            res.json({result : "Cant add to Cart",status : false});
        }
    })
}

function listOfUserAPI(req,res){
    User.find({},function(req,results){
        res.json({result : results,status : true});
    })
};

function updateProfile(req,res){
    var query = {};
    var updateQuery = {};
    if(req.body.query){
        query._id = new ObjectId(req.body._id)
    }
    if(req.body.updateQuery){
        updateQuery = req.body.updateQuery;
        User.update(query,updateQuery,function(req,results){
            res.json({result : results,status : true});

        })
    }else{
        res.json({result : req.body,status : false});
    }
};

module.exports.createUser = createUserAPI;
module.exports.listOfUser = listOfUserAPI;
module.exports.loginToApp = loginToApp;
module.exports.addToCart = addToCart;
module.exports.updateProfile = updateProfile;
