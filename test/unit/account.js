/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect;
var Account  = require('../../app/models/account');
var dbConnect = require('../../app/lib/mongodb');
var cp        = require('child_process');
var db        = 'bankr-test';
var Mongo     = require('mongodb');
var Transaction = require('../../app/models/account');
var Transfer = require('../../app/models/transfer');

describe('Account', function(){
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
    it('should create a new account', function(){
      var obj = {name:'Juanita Irvin',  photo:'http://google.com', accountType: 'savings', color:'lightblue',
        dateCreated:'2012-04-15', pin:'3456', initDeposit:'1000', balance:'500'};
      var a = new Account(obj);

      expect(a).to.be.okay;
      expect(a).to.be.instanceof(Account);
      expect(a.accountType).to.equal('savings');
      expect(a.balance).to.equal(500.00);
      expect(a.initDeposit).to.equal(1000.00);
      expect(a.color).to.equal('lightblue');
      expect(a.pin).to.equal('3456');
      expect(a.photo).to.equal('http://google.com');
      expect(a.dateCreated).to.be.instanceof(Date);
    });
  });

  describe('#create', function(){
    it('should create a new account and save it to the database', function(done){
      var obj = {name:'Juanita Irvin',  photo:'http://google.com', accountType: 'savings', color:'lightblue',
        dateCreated:'2012-04-15', pin:'3456', initDeposit:'1000', balance:'500'};
      var account = new Account(obj);

      account.create(function(result){
        expect(result).to.be.instanceof(Account);
        expect(result._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should find an account', function(done){
      var accountId = '53e5659ee1eb2778810b9d4a';
      Account.findById(accountId, function(account){
        expect(account.transactions).to.not.be.a('null');
        expect(account.transactions).to.have.length.gt(1);
        expect(account.transfers).to.not.be.a('null');
        expect(account.transfers).to.have.length.gt(1);
        expect(account).to.be.instanceof(Account);
        done();
      });
    });
  });

  describe('.findAll', function(){
    it('should find all the accounts in the database', function(done){
      Account.findAll(function(accounts){
        expect(accounts).to.not.be.a('null');
        expect(accounts).to.have.length.gt(0);
        done();
      });
    });
  });

  describe('#validatePin', function(){
    it('should validate the pin number', function(done){
      var id = '53e5659ee1eb2778810b9d4a';
      var pin = '9505';
      Account.findById(id, function(account){
        expect(account.pin).to.equal(pin);
        expect(account.validatePin(pin)).to.be.true;
        done();
      });
    });
    it('stop invalid pin numbers', function(done){
      var id = '53e5659ee1eb2778810b9d4b';
      var pin = '9505';
      Account.findById(id, function(account){
        expect(account.validatePin(pin)).to.be.false;
        done();
      });
    });
  });

  describe('#deposit', function(){
    it('should allow accountholder to deposit money into account', function(done){
      var id = '53e5659ee1eb2778810b9d4a';
      Account.findById(id, function(account){
        var initbalance = account.balance;
        var deposit = 100;
        account.deposit(deposit, function(cb){
          expect(account.balance).to.equal(deposit + initbalance);
          done();
        });
      });
    });
  });

  describe('#withdraw', function(){
    it('should make a withdrawl from an account', function(done){
      var id = '53e5659ee1eb2778810b9d4a';
      Account.findById(id, function(account){
        var initbalance = account.balance;
        var withdrawl = 100;
        account.withdraw(withdrawl, function(transaction){
          expect(account.balance).to.equal(initbalance - withdrawl);
          expect(transaction.fee).to.equal(0);
          done();
        });
      });
    });
    it('should make a withdrawl from an account and add a od fee', function(done){
      var id = '53e5659ee1eb2778810b9d4a';
      Account.findById(id, function(account){
        var initbalance = account.balance;
        var withdrawl = 7600;
        account.withdraw(withdrawl, function(transaction){
          expect(account.balance).to.equal(initbalance - (withdrawl+50));
          expect(transaction.fee).to.equal(50);
          done();
        });
      });
    });
  });
  describe('.transfer', function(){
    it('should transfer money from one acct to another, and charge fee', function(done){
      var id1 = '53e5659ee1eb2778810b9d4a';
      var id2 = '53e5659ee1eb2778810b9d4b';
      var amount = 100;
      Account.findById(id1, function(before1){
        Account.findById(id2, function(before2){
          Account.transfer(id1, id2, amount, function(transfer){
            Account.findById(id1, function(after1){
              Account.findById(id2, function(after2){
                expect(transfer).to.not.be.a('null');
                expect(after1.balance).to.be.lt(before1.balance);
                expect(after2.balance).to.be.gt(before2.balance);
                expect(transfer.fee).to.equal(25);
                done();
              });
            });
          });
        });
      });
    });
    it('should not transfer money from one acct to another, insuficient funds', function(done){
      var id1 = '53e5659ee1eb2778810b9d4a';
      var id2 = '53e5659ee1eb2778810b9d4b';
      var amount = 10000;
      Account.findById(id1, function(before1){
        Account.findById(id2, function(before2){
          Account.transfer(id1, id2, amount, function(transfer){
            Account.findById(id1, function(after1){
              Account.findById(id2, function(after2){
                expect(after1.balance).to.equal(before1.balance);
                expect(after2.balance).to.equal(after2.balance);
                expect(transfer).to.be.null;
                done();
              });
            });
          });
        });
      });
    });
  });

});
