/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect;
var Transfer  = require('../../app/models/transfer');
var dbConnect = require('../../app/lib/mongodb');
var cp        = require('child_process');
var db        = 'bankr-test';
var Mongo     = require('mongodb');

describe('Transfer', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/freshdb.sh', [db], {cwd:__dirname + '/../scripts'}, function(){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new transfer', function(){
      var obj = {amount:'50', date: '2014-8-8', fee: '25', 
      toAccountId: Mongo.ObjectID().toString(), 
      fromAccountId: Mongo.ObjectID().toString()};
      var t = new Transfer(obj);

      expect(t).to.be.okay;
      expect(t).to.be.instanceof(Transfer);
      expect(t.amount).to.equal(50.00);
      expect(t.fee).to.equal(25);
      expect(t.date).to.be.instanceof(Date);
      expect(t.toAccountId).to.be.instanceof(Mongo.ObjectID);
      expect(t.fromAccountId).to.be.instanceof(Mongo.ObjectID);
    });
  });
  describe('.create', function(){
    it('should create a new transfer and save it to the database', function(done){
      var obj = {amount:'50', date: '2014-8-8', fee: '25', 
      toAccountId: Mongo.ObjectID().toString(), 
      fromAccountId: Mongo.ObjectID().toString()};
      
      Transfer.create(obj, function(transfer){
        expect(transfer).to.be.instanceof(Transfer);
        expect(transfer._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });
describe('.findById', function(){
    it('should find transfers by the toAccountId and fromAccountId', function(done){
      var accountId = '53e5659ee1eb2778810b9d4a';
      Transfer.findById(accountId, function(err, transfers){
        console.log('transfers', transfers);
        //expect(transfers).to.not.be(null);
        expect(transfers).to.have.length.gt(0);
        done();
      });
    });
  });
});

