/**
 * Created by mahasagar on 20/12/16.
 */
var Order = require('../models/Order');

function placeOrder(req,res){
    var newOrder = new Order(req.body);
    newOrder.save(function(err,result){
        res.json(result);
    });
}

function getAllOrders(req,res){
    Order.find({},function(req,results){
        res.json(results);
    })
};

module.exports.placeOrder = placeOrder;
module.exports.getAllOrders = getAllOrders;