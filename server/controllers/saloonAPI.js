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

module.exports.addSaloonBusiness = addSaloonBusiness;
module.exports.getSaloonBusiness = getSaloonBusiness;