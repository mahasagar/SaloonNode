/**
 * Created by mahasagar on 19/12/16.
 */
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = mongoose.model('User',{
    name: {type: String},
    auth : {
        username: {type: String},
        password: {type: String}
    },
    email : {type: String},
    address :{
        fullAddress : {type: String},
        lat : {type: String},
        long : {type: String}
    },
    userType : {type: [String]},
    status : {type: String},
    contactNumbers : {
        mobile : {type: String},
        landLine :  {type: String}
    },
    GCMToken : {type: String},
    updatedAt : {type: Date},
    createdDate: {type: Date, require: true, default: Date.now}
});