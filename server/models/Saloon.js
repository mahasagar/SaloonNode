/**
 * Created by mahasagar on 20/12/16.
 */

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = mongoose.model('Saloon',{
    name : {type: String},
    address :{
        fullAddress : {type: String},
        pincode :{type: Number},
        lat : {type: String},
        long : {type: String}
    },
    contact:{
        primary :{type: Number},
        secondary:{type: Number}
    },
    saloonType : {type: String},
    enableSMS : {type : Boolean},
    wallet : {type : Number},
    services : [
        {
            segmentName: {type: String,require: true},
            subSegmentName: {type: String,require: true},
            unitPrice: {type: Number},
            startDate : { type : Date , default : Date.now}
        }
    ],
    noOfAppointment : {type: Number},
    workingHours :{
        open : {type: String},
        close :{type: String}
    },
    workingDays :{type: [String]},
    paymentMode : {type: [String]},
    userId : {type: String},
    userName : {type: String},
    saloonPriceType : {type: String},
    saloonImg : [ {type: String}],
    saloonFacilities : [ {type: String}],
    reviews : [{
        reviewerName : {type: String},
        comment : {type: String},
        date : {type: Date},
        rating : {type: Number}
    }],
    updatedAt : {type: Date},
    createdDate: {type: Date, require: true, default: Date.now}
});
