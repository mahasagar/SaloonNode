/**
 * Created by mahasagar on 20/12/16.
 */
var Appointment = require('../models/Appointment');
var _ = require('lodash');

 function generateOrderId() {
      var length = 17;
      var timestamp = + new Date();
      var randomInt = function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
      };
      var ts = timestamp.toString();
      var parts = ts.split('').reverse();
      var id = '';
      for( var i = 0; i < length; ++i ) {
        var index = randomInt( 0, parts.length - 1 );
        id += parts[index];
      }
      return 'S_A'+id;
    }



function bookAppointment(req,res){
    console.log("req.body ",JSON.stringify(req.body));
    var  newAppointment = req.body;
   
    newAppointment.appointmentId = generateOrderId();
    newAppointment.appointmentStatus = "NEW";
   
    console.log("req.body in ",JSON.stringify(newAppointment));
    var appointment = new Appointment(newAppointment);
    console.log("appointment :",JSON.stringify(appointment));
    appointment.save(function(err,result){
        console.log("err",JSON.stringify(err));
        console.log("result",JSON.stringify(result));
         if(result){
             res.json({"result" : true});
         }else{
            res.json({"result" : false});
         }
     });

}

function getBookingList(req,res){
    var query = req.body;
    console.log("req.body : "+JSON.stringify(req.body))
    /*var query = {
        businessId : req.body.businessId
    };
    var queryFinal = Order.find(query);
    queryFinal.sort('-createdDate');
    queryFinal.exec(function(err, results) {
        if (err) throw err;
        res.json(results);
    });*/

    Appointment.find(query,{},{sort : {appointmentDate: -1}},function(req,results){
        console.log("result : "+JSON.stringify(results))
        res.json(results);
    })
};


function updateBooking(req,res){
    var queryUpdate = {};
    var query = {};
    if(req.body.appointmentId){
        query.appointmentId =  req.body.appointmentId;
    }
    if(req.body.appointmentStatus){
        queryUpdate.appointmentStatus= req.body.appointmentStatus;
    }
    if(req.body.grandTotal){
        queryUpdate.grandTotal= req.body.grandTotal;
    }
    console.log("req.body : "+JSON.stringify(queryUpdate))
    Appointment.update(query,{'$set' : queryUpdate},function(req,results){
        console.log("result : "+JSON.stringify(results))
        res.json(results);
    })
};

function getUserDetailsByMobile(req,res){
    var select = {};
    var condition = {};
    var query={};
    if(req.body.query){
        query = req.body.query;
    }
    if( req.body.selection){
        select = req.body.selection;
    }
    if(req.body.limit){
        condition.limit = req.body.limit
    }
    condition.sort = {
        createdDate: -1
    };
    Appointment.find(query,select,condition,function(req,results){
        res.json({result : results[0]} );
    })
};


function getSaloonAppointmentAmount(req,res){
    var select = {};
    var condition = {};
    var query={};
    if(req.body.query){
        query = req.body.query;
    }
    if( req.body.selection){
        select = req.body.selection;
    }
    if(req.body.limit){
        condition.limit = req.body.limit
    }
    condition.sort = {
        createdDate: -1
    };
    Appointment.find(query,select,condition,function(req,results){
        res.json({result : results[0]} );
    })
};

function customerOrdersReport(req, res){
    var query = [];
    query.push(
        {

            $match: {
                'businessInfo.to.businessId': req.body.businessId,
                'appointmentDate': {
                    $gte: new Date(req.body.year+'-01-01T00:00:00.000+0530'),
                    $lte: new Date(req.body.year+'-12-31T23:59:59.000+0530')
                }
            }
        }
    );
    query.push(
        {
            '$group' : {
                '_id' : {
                    'month' : { '$month' : '$appointmentDate'}
                },
                'count': { '$sum': 1 },
                'grandTotal': { '$sum': '$grandTotal' }

            }
        }
    );
    // console.log(query);
    Appointment.aggregate( query, function(err, orderData){
        console.log('orderData' +JSON.stringify(orderData));
        if( orderData ) {
            var countsData = {};
            var grandTotalData = {};
            for (var i = 0; i < orderData.length; i++) {
                if (!countsData[orderData[i]._id.salonName]) {
                    countsData[orderData[i]._id.salonName] = {
                        name: orderData[i]._id.salonName,
                        type: 'column',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    };
                }
                countsData[orderData[i]._id.salonName].data[orderData[i]._id.month - 1] = orderData[i].count;
                if (!grandTotalData[orderData[i]._id.salonName]) {
                    grandTotalData[orderData[i]._id.salonName] = {
                        name: orderData[i]._id.salonName,
                        type: 'column',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    };
                }
                grandTotalData[orderData[i]._id.salonName].data[orderData[i]._id.month - 1] = Math.round( orderData[i].grandTotal * 100) / 100;
            }
            //console.log('--------------\n\n\n', countsData,'\n\n\n--------------', grandTotalData, '\n\n\n--------------');
            var retObj = {'orderCount': _.values(countsData), 'orderGrandTotalAmount': _.values(grandTotalData)};
            res.json(retObj);
        }else{
            res.json([]);
        }
    } );
}

function customerOrdersReporttest(req, res){
    var query = [];
    query.push(
        {

            $match: {
                'createdDate': {
                    $gte: new Date(req.body.year+'-01-01T00:00:00.000+0530'),
                    $lte: new Date(req.body.year+'-12-31T23:59:59.000+0530')
                }
            }
        }
    );
    query.push(
        {
            '$group' : {
                '_id' : {
                    'month' : { '$month' : '$createdDate'}
                },
                'count': { '$sum': 1 }

            }
        }
    );
    query.push({ $sort : { _id: 1 } });
    console.log('query',query);
    Appointment.aggregate( query, function(err, orderData){
        console.log('orderData==================' +JSON.stringify(orderData));
        if(orderData){
            var monthCountData = {
                1 : 0,
                2 : 0,
                3 : 0,
                4 : 0,
                5 : 0,
                6 : 0,
                7 : 0,
                8 : 0,
                9 : 0,
                10 : 0,
                11 : 0,
                12 : 0
            };
            for(var i = 0 ; i < orderData.length ; i++){
                monthCountData[orderData[i]._id.month] = orderData[i].count;
            }
            res.json({userCount : _.values(monthCountData)});
        }else{
            res.json([]);
        }

    } );
}



module.exports.getUserDetailsByMobile = getUserDetailsByMobile;
module.exports.bookAppointment = bookAppointment;
module.exports.getBookingList = getBookingList;
module.exports.updateBooking = updateBooking;
module.exports.customerOrdersReporttest = customerOrdersReporttest;
module.exports.getSaloonAppointmentAmount = getSaloonAppointmentAmount;
module.exports.customerOrdersReport = customerOrdersReport;


