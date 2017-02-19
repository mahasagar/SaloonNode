/**
 * Created by mahasagar on 20/12/16.
 */
/**
 * Created by mahasagar on 20/12/16.
 */

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = mongoose.model('Appointments',{
    appointmentId : {type: String},
    appointmentStatus: {type: String},
    appointmentType : {type: String},
    appointmentDate : { type : Date},
    appointmentTime : {type: String},
    grandTotal : {type: Number},
    businessInfo : {
        to : {
            businessId : {type: String},
            name : {type: String},
            contactInfo : {
                name : {type: String},
                number :{type: String}
            }
        },
        from : {
            userId : {type : String},
            name : {type: String},
            email : {type: String,default : ''},
            gender :  {type: String},
            contactInfo : {
                name : {type: String},
                number :{type: String}
            }
        }
    },
    services : [
        {
            segmentName: {type: String,require: true},
            subSegmentName: {type: String,require: true},
            unitPrice: {type: Number}

        }
    ],
    bookingTime :{
        from : {type: String},
        to :{type: String}
    },
    updatedAt : {type: Date},
    paymentMode : {type: String},
    createdDate: {type: Date, require: true, default: Date.now}
});



