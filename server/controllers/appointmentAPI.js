/**
 * Created by mahasagar on 20/12/16.
 */
var Appointment = require('../models/Appointment');

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

    Appointment.find(query,function(req,results){
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


module.exports.getUserDetailsByMobile = getUserDetailsByMobile;
module.exports.bookAppointment = bookAppointment;
module.exports.getBookingList = getBookingList;
module.exports.updateBooking = updateBooking;