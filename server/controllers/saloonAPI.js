/**
 * Created by mahasagar on 20/12/16.
 */
/**
 * Created by mahasagar on 20/12/16.
 */
var Saloon = require('../models/Saloon');

function addSaloonBusiness(req,res){
    var newBusiness = new Saloon(req.body);
    newBusiness.save(function(err,result){
        res.json(result);
    });
}

function getSaloonBusiness(req,res){
    var query = {
        userId : req.body.userId
    };
    Saloon.find(query,function(req,results){
        res.json(results);
    })
};


function getAllSaloons(req,res){
    var query = {};
    if(req.body.name){
        query.name = new RegExp(req.body.name, 'i')
    }
    var select = { name: 1, address: 1 };

    Saloon.find(query,select ,function(req,results){
        res.json(results);
    })
};


function getBusinessById(req,res){
    var query = {
        _id : req.body._id
    };
    Saloon.find(query,function(req,results){
        res.json({result : results[0]} );
    })
};

function getServicesBySaloonId(req,res){
    var query = {
        _id : req.body._id
    };
    var select = { services: 1, name: 1 };

    Saloon.find(query,select,function(req,results){
        res.json({result : results[0]} );
    })
};

module.exports.addSaloonBusiness = addSaloonBusiness;
module.exports.getSaloonBusiness = getSaloonBusiness;
module.exports.getBusinessById = getBusinessById;
module.exports.getAllSaloons = getAllSaloons;
module.exports.getServicesBySaloonId = getServicesBySaloonId;
