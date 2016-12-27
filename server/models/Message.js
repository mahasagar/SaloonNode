/*
 * server/models/CampaignMessage.js
 */

'use strict';

var mongoose = require('mongoose');
//var mongooseTimestamp = require('mongoose-timestamp');

// Schema
var schema = new mongoose.Schema({
    businessId: {type: mongoose.Schema.Types.ObjectId, require: true},
    messageId: {type: String},
    recipientName: {type: String},
    recipientNumber: {type: String},
    email:{type: String},
    message: {type: String},
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    createdDate: {type: Date, require: true, default: Date.now},
    status: {type: String, require: true, default:'New'}
});

//schema.index({'createdDate': 1}, {expireAfterSeconds: 259200});// 3 days

// Model
var model = mongoose.model('Message', schema);

// Public API
module.exports = model;
