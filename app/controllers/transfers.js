'use strict';

var Transfer = require('../models/transfer');
var Account = require('../models/account');

exports.init = function(req,res){

};

exports.create = function(req,res){
  Transfer.create(req.body, function(transfer){

  });
};
