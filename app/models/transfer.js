'use strict';

var Mongo = require('mongodb');

function Transfer(obj){
  this.amount = parseFloat(obj.amount);
  this.date   = new Date(obj.date);
  this.toAccountId = Mongo.ObjectID(obj.toAccountId);
  this.fromAccountId = Mongo.ObjectID(obj.fromAccountId);
  this.fee = parseFloat(obj.fee);
}

Object.defineProperty(Transfer, 'collection',{
  get: function(){
    return global.mongodb.collection('transfers');
  }
});

Transfer.create = function(obj, cb){
  var transfer = new Transfer(obj);
  
  Transfer.collection.save(transfer, function(){
    cb(transfer);
  });
};

Transfer.findByAccountId = function(accountId, cb) {
  Transfer.collection.find({
    $query: {$or:[{toAccountId: Mongo.ObjectID(accountId)},
        {fromAccountId: Mongo.ObjectID(accountId)}]},
    $orderby:{date: -1}}).toArray(function(err, result){
    cb(result);
  });
};
module.exports = Transfer;
