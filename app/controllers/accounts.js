'use strict';

var Transfer = require('../models/transfer');
var Account = require('../models/account');
var Transaction = require('../models/transaction');

exports.init = function(req,res){
  res.render('account/init');
};

exports.create = function(req,res){
  Account.create(req.body, function(){
    res.redirect('/accounts');
  });
};

exports.index = function(req,res){
  Account.findAll(function(accounts){
    res.render('account/index', {accounts:accounts});
  });
};

exports.show = function(req,res){
  Account.findById(req.params.id, function(account){
    res.render('account/show', {account:account});
  });
};
